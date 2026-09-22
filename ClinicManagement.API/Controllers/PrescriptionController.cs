using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/luot-kham/{luotKhamId:int}/don-thuoc")]
public class PrescriptionController(ClinicDbContext db, IInventorySettings settings) : BaseController
{
    public sealed record PrescriptionItem(int ItemId, decimal SoLuongKe, string DonViTinh, decimal? DonGiaKe,
        string? LieuDung, string? TanSuat, int? SoNgay, string? HuongDan);
    public sealed record CreatePrescriptionRequest(string? GhiChu, IEnumerable<PrescriptionItem> Items);

    [HttpPost]
    public async Task<IActionResult> Create(int luotKhamId, CreatePrescriptionRequest request)
    {
        var visit = await db.LuotKhams.FirstOrDefaultAsync(x => x.Id == luotKhamId);
        if (visit is null) return Failure("Không tìm thấy lượt khám.", 404);
        if (visit.EmrLocked) return Failure("Hồ sơ EMR đã khóa, không thể kê đơn.", 409);
        if (visit.TrangThai != TrangThaiLuotKham.DANG_KHAM) return Failure("Chỉ được kê đơn khi lượt khám đang khám.", 409);
        if (visit.MaBacSi is null) return Failure("Lượt khám chưa được phân bác sĩ.", 409);

        var lines = request.Items.ToList();
        if (lines.Count == 0) return Failure("Đơn thuốc phải có ít nhất một dòng.");

        // Kiểm tra xem lượt khám đã có đơn thuốc chưa để tránh lưu trùng lặp nhiều đơn
        var existingPrescription = await db.DonThuocs
            .Include(x => x.ChiTietDonThuocs)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(x => x.MaLuotKham == luotKhamId && x.TrangThai != TrangThaiDonThuoc.HUY);

        DonThuoc prescription;
        bool isUpdated = false;

        if (existingPrescription is not null)
        {
            if (existingPrescription.TrangThai != TrangThaiDonThuoc.TAM)
            {
                var statusText = existingPrescription.TrangThai == TrangThaiDonThuoc.DA_DUYET ? "Đã duyệt / Chờ cấp phát" : existingPrescription.TrangThai.ToString();
                return Failure($"Lượt khám này đã có đơn thuốc ({statusText}). Không thể kê thêm hoặc sửa đơn thuốc đã duyệt.", 409);
            }

            // Nếu là đơn tạm, cập nhật đơn thuốc hiện có thay vì tạo bản ghi DonThuoc mới
            db.ChiTietDonThuocs.RemoveRange(existingPrescription.ChiTietDonThuocs);
            existingPrescription.ChiTietDonThuocs.Clear();
            prescription = existingPrescription;
            isUpdated = true;
        }
        else
        {
            prescription = new DonThuoc(luotKhamId, visit.MaBacSi.Value, visit.MaCoSo, CurrentUserId);
            db.DonThuocs.Add(prescription);
        }

        var itemIds = lines.Select(x => x.ItemId).ToList();
        var items = await db.Items.Where(x => itemIds.Contains(x.Id) && x.IsActive).Include(x => x.DonViTinhQuyDois).ToDictionaryAsync(x => x.Id);
        var warehouseId = settings.DefaultWarehouseId;

        foreach (var line in lines)
        {
            if (!items.TryGetValue(line.ItemId, out var item)) return Failure($"Mặt hàng {line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);
            if (!item.CanKeDon) return Failure($"Mặt hàng {item.Ma} không được kê đơn.", 409);
            if (line.SoLuongKe <= 0 || prescription.ChiTietDonThuocs.Any(x => x.MaItem == line.ItemId))
                return Failure("Số lượng không hợp lệ hoặc mặt hàng bị kê trùng.", 400);
            var unit = string.IsNullOrWhiteSpace(line.DonViTinh) ? item.DonViTinhCoBan : line.DonViTinh;
            var factor = unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)
                ? 1 : item.DonViTinhQuyDois.FirstOrDefault(x => x.DonVi.Equals(unit, StringComparison.OrdinalIgnoreCase))?.HeSo ?? 0;
            if (factor <= 0) return Failure($"Đơn vị {unit} không hợp lệ cho {item.Ma}.");

            var baseQty = line.SoLuongKe * factor;
            var rawStock = await db.TonKhos
                .Where(x => x.MaKho == warehouseId &&
                            x.MaItem == item.Id &&
                            x.SoLuongTon > 0 &&
                            (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .SumAsync(x => (decimal?)x.SoLuongTon) ?? 0;

            var reservedStock = await db.ChiTietDonThuocs
                .Where(x => x.MaItem == item.Id && x.DonThuoc.TrangThai == TrangThaiDonThuoc.DA_DUYET && x.MaDonThuoc != prescription.Id)
                .SumAsync(x => (decimal?)(x.SoLuongKe - x.SoLuongDaXuat)) ?? 0;

            var availableStock = Math.Max(0, rawStock - reservedStock);

            if (availableStock <= 0)
            {
                return Failure($"Thuốc '{item.Ten}' ({item.Ma}) đã HẾT HÀNG trong kho (tồn khả dụng = 0 {item.DonViTinhCoBan}). Không thể kê đơn thuốc này.", 409);
            }

            if (availableStock < baseQty)
            {
                return Failure($"Thuốc '{item.Ten}' ({item.Ma}) không đủ tồn kho khả dụng để kê đơn. Tồn khả dụng: {availableStock} {item.DonViTinhCoBan}, số lượng kê: {baseQty} {item.DonViTinhCoBan} ({line.SoLuongKe} {unit}). Vui lòng giảm số lượng hoặc đổi thuốc khác.", 409);
            }

            prescription.AddItem(item.Id, baseQty, line.DonGiaKe ?? item.GiaBanLe,
                line.LieuDung, line.TanSuat, line.SoNgay, line.HuongDan);
        }
        prescription.GhiChuForApplication(request.GhiChu);
        await db.SaveChangesAsync();
        return Success(new { id = prescription.Id, trangThai = "TAM", isUpdated });
    }

    [HttpPut("{donThuocId:int}/items")]
    public async Task<IActionResult> ReplaceItems(int luotKhamId, int donThuocId, CreatePrescriptionRequest request)
    {
        var prescription = await db.DonThuocs.Include(x => x.ChiTietDonThuocs)
            .FirstOrDefaultAsync(x => x.Id == donThuocId && x.MaLuotKham == luotKhamId);
        if (prescription is null) return Failure("Không tìm thấy đơn thuốc.", 404);
        var visit = await db.LuotKhams.FirstAsync(x => x.Id == luotKhamId);
        if (visit.EmrLocked) return Failure("Hồ sơ EMR đã khóa, không thể sửa đơn.", 409);
        if (prescription.TrangThai != TrangThaiDonThuoc.TAM) return Failure("Chỉ được sửa đơn tạm.", 409);
        db.ChiTietDonThuocs.RemoveRange(prescription.ChiTietDonThuocs);
        var warehouseId = settings.DefaultWarehouseId;

        foreach (var line in request.Items)
        {
            var item = await db.Items.Include(x => x.DonViTinhQuyDois).FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null || !item.CanKeDon) return Failure("Mặt hàng không hợp lệ.", 409);
            if (line.SoLuongKe <= 0 || prescription.ChiTietDonThuocs.Any(x => x.MaItem == line.ItemId))
                return Failure("Số lượng không hợp lệ hoặc mặt hàng bị kê trùng.");
            var unit = string.IsNullOrWhiteSpace(line.DonViTinh) ? item.DonViTinhCoBan : line.DonViTinh;
            var factor = unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)
                ? 1 : item.DonViTinhQuyDois.FirstOrDefault(x => x.DonVi.Equals(unit, StringComparison.OrdinalIgnoreCase))?.HeSo ?? 0;
            if (factor <= 0) return Failure("Đơn vị quy đổi không hợp lệ.");

            var baseQty = line.SoLuongKe * factor;
            var rawStock = await db.TonKhos
                .Where(x => x.MaKho == warehouseId &&
                            x.MaItem == item.Id &&
                            x.SoLuongTon > 0 &&
                            (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .SumAsync(x => (decimal?)x.SoLuongTon) ?? 0;

            var reservedStock = await db.ChiTietDonThuocs
                .Where(x => x.MaItem == item.Id && x.DonThuoc.TrangThai == TrangThaiDonThuoc.DA_DUYET && x.MaDonThuoc != donThuocId)
                .SumAsync(x => (decimal?)(x.SoLuongKe - x.SoLuongDaXuat)) ?? 0;

            var availableStock = Math.Max(0, rawStock - reservedStock);

            if (availableStock <= 0)
            {
                return Failure($"Thuốc '{item.Ten}' ({item.Ma}) đã HẾT HÀNG trong kho (tồn khả dụng = 0 {item.DonViTinhCoBan}). Không thể kê đơn thuốc này.", 409);
            }

            if (availableStock < baseQty)
            {
                return Failure($"Thuốc '{item.Ten}' ({item.Ma}) không đủ tồn kho khả dụng để kê đơn. Tồn khả dụng: {availableStock} {item.DonViTinhCoBan}, số lượng kê: {baseQty} {item.DonViTinhCoBan} ({line.SoLuongKe} {unit}). Vui lòng giảm số lượng hoặc đổi thuốc khác.", 409);
            }

            prescription.AddItem(item.Id, baseQty, line.DonGiaKe ?? item.GiaBanLe,
                line.LieuDung, line.TanSuat, line.SoNgay, line.HuongDan);
        }
        prescription.GhiChuForApplication(request.GhiChu);
        await db.SaveChangesAsync();
        return Success(new { id = donThuocId, trangThai = "TAM" });
    }

    [HttpPost("{donThuocId:int}/approve")]
    public async Task<IActionResult> Approve(int luotKhamId, int donThuocId)
    {
        var prescription = await db.DonThuocs.Include(x => x.ChiTietDonThuocs)
            .FirstOrDefaultAsync(x => x.Id == donThuocId && x.MaLuotKham == luotKhamId);
        if (prescription is null) return Failure("Không tìm thấy đơn thuốc.", 404);
        var visit = await db.LuotKhams.FirstAsync(x => x.Id == luotKhamId);
        if (visit.EmrLocked) return Failure("Hồ sơ EMR đã khóa, không thể duyệt đơn.", 409);
        if (CurrentUserId > 0 && prescription.MaBacSi != CurrentUserId) return Failure("Chỉ bác sĩ kê đơn mới được xác nhận.", 403);
        if (await db.DonThuocs.AnyAsync(x => x.MaLuotKham == luotKhamId && x.Id != donThuocId && x.TrangThai == TrangThaiDonThuoc.DA_DUYET))
            return Failure("Lượt khám đã có đơn chờ cấp phát.", 409);

        // Kiểm tra lại tồn kho trước khi duyệt đơn
        var warehouseId = settings.DefaultWarehouseId;
        foreach (var line in prescription.ChiTietDonThuocs)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.MaItem && x.IsActive);
            if (item is null) return Failure($"Thuốc #{line.MaItem} không tồn tại hoặc đã ngừng dùng.", 404);

            var availableStock = await db.TonKhos
                .Where(x => x.MaKho == warehouseId &&
                            x.MaItem == line.MaItem &&
                            x.SoLuongTon > 0 &&
                            (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .SumAsync(x => x.SoLuongTon);

            if (availableStock < line.SoLuongKe)
            {
                return Failure($"Không thể duyệt đơn: Thuốc '{item.Ten}' ({item.Ma}) không còn đủ tồn khả dụng (Tồn: {availableStock}, Kê: {line.SoLuongKe}). Vui lòng sửa đơn thuốc.", 409);
            }
        }

        try { prescription.Approve(); } catch (InvalidOperationException ex) { return Failure(ex.Message, 409); }
        await db.SaveChangesAsync();
        return Success(new { id = donThuocId, trangThai = "CHO_CAP_PHAT" });
    }

    [HttpPost("{donThuocId:int}/cancel")]
    public async Task<IActionResult> Cancel(int luotKhamId, int donThuocId)
    {
        var visit = await db.LuotKhams.FirstOrDefaultAsync(x => x.Id == luotKhamId);
        if (visit?.EmrLocked == true) return Failure("Hồ sơ EMR đã khóa, không thể hủy đơn.", 409);
        var prescription = await db.DonThuocs.FirstOrDefaultAsync(x => x.Id == donThuocId && x.MaLuotKham == luotKhamId);
        if (prescription is null) return Failure("Không tìm thấy đơn thuốc.", 404);
        try { prescription.Cancel(); } catch (InvalidOperationException ex) { return Failure(ex.Message, 409); }
        await db.SaveChangesAsync();
        return Success(new { id = donThuocId, trangThai = "HUY" });
    }

    [HttpGet("{donThuocId:int}")]
    public async Task<IActionResult> Get(int luotKhamId, int donThuocId)
    {
        var prescription = await db.DonThuocs.AsNoTracking().Include(x => x.ChiTietDonThuocs).ThenInclude(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == donThuocId && x.MaLuotKham == luotKhamId);
        if (prescription is null) return Failure("Không tìm thấy đơn thuốc.", 404);
        return Success(new
        {
            id = prescription.Id,
            prescription.MaLuotKham,
            prescription.MaBacSi,
            trangThai = prescription.TrangThai == TrangThaiDonThuoc.DA_DUYET ? "CHO_CAP_PHAT" : prescription.TrangThai.ToString(),
            prescription.GhiChu,
            items = prescription.ChiTietDonThuocs.Select(x => new
            {
                itemId = x.MaItem,
                thuocId = x.MaItem,
                itemName = x.Item.Ten,
                tenThuoc = x.Item.Ten,
                quantity = x.SoLuongKe,
                soLuong = x.SoLuongKe,
                baseUnit = x.Item.DonViTinhCoBan,
                donViTinh = x.Item.DonViTinhCoBan,
                x.DonGiaKe,
                donGia = x.DonGiaKe,
                x.LieuDung,
                x.TanSuat,
                x.SoNgay,
                x.HuongDan,
                huongDanSuDung = x.HuongDan
            })
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetLatest(int luotKhamId, CancellationToken cancellationToken)
    {
        var prescription = await db.DonThuocs.AsNoTracking()
            .Include(x => x.ChiTietDonThuocs).ThenInclude(x => x.Item)
            .Where(x => x.MaLuotKham == luotKhamId && x.TrangThai != TrangThaiDonThuoc.HUY)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken)
            ?? await db.DonThuocs.AsNoTracking()
                .Include(x => x.ChiTietDonThuocs).ThenInclude(x => x.Item)
                .Where(x => x.MaLuotKham == luotKhamId)
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

        if (prescription is null) return Success<object?>(null);
        return Success(new
        {
            id = prescription.Id,
            prescription.MaLuotKham,
            prescription.MaBacSi,
            trangThai = prescription.TrangThai == TrangThaiDonThuoc.DA_DUYET ? "CHO_CAP_PHAT" : prescription.TrangThai.ToString(),
            prescription.GhiChu,
            items = prescription.ChiTietDonThuocs.Select(x => new
            {
                itemId = x.MaItem,
                thuocId = x.MaItem,
                itemName = x.Item.Ten,
                tenThuoc = x.Item.Ten,
                quantity = x.SoLuongKe,
                soLuong = x.SoLuongKe,
                baseUnit = x.Item.DonViTinhCoBan,
                donViTinh = x.Item.DonViTinhCoBan,
                x.DonGiaKe,
                donGia = x.DonGiaKe,
                x.LieuDung,
                x.TanSuat,
                x.SoNgay,
                x.HuongDan,
                huongDanSuDung = x.HuongDan
            })
        });
    }
}
