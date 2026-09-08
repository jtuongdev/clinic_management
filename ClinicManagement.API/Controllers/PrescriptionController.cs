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
public class PrescriptionController(ClinicDbContext db) : BaseController
{
    public sealed record PrescriptionItem(int ItemId, decimal SoLuongKe, string DonViTinh, decimal? DonGiaKe,
        string? LieuDung, string? TanSuat, int? SoNgay, string? HuongDan);
    public sealed record CreatePrescriptionRequest(string? GhiChu, IEnumerable<PrescriptionItem> Items);

    [HttpPost]
    public async Task<IActionResult> Create(int luotKhamId, CreatePrescriptionRequest request)
    {
        var visit = await db.LuotKhams.FirstOrDefaultAsync(x => x.Id == luotKhamId);
        if (visit is null) return Failure("Không tìm thấy lượt khám.", 404);
        if (visit.TrangThai != TrangThaiLuotKham.DANG_KHAM) return Failure("Chỉ được kê đơn khi lượt khám đang khám.", 409);
        if (visit.MaBacSi is null) return Failure("Lượt khám chưa được phân bác sĩ.", 409);
        var prescription = new DonThuoc(luotKhamId, visit.MaBacSi.Value, visit.MaCoSo, CurrentUserId) { };
        var lines = request.Items.ToList();
        if (lines.Count == 0) return Failure("Đơn thuốc phải có ít nhất một dòng.");
        var itemIds = lines.Select(x => x.ItemId).ToList();
        var items = await db.Items.Where(x => itemIds.Contains(x.Id) && x.IsActive).Include(x => x.DonViTinhQuyDois).ToDictionaryAsync(x => x.Id);
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
            prescription.AddItem(item.Id, line.SoLuongKe * factor, line.DonGiaKe ?? item.GiaBanLe,
                line.LieuDung, line.TanSuat, line.SoNgay, line.HuongDan);
        }
        prescription.GhiChuForApplication(request.GhiChu);
        db.DonThuocs.Add(prescription);
        await db.SaveChangesAsync();
        return Success(new { id = prescription.Id, trangThai = "TAM" });
    }

    [HttpPut("{donThuocId:int}/items")]
    public async Task<IActionResult> ReplaceItems(int luotKhamId, int donThuocId, CreatePrescriptionRequest request)
    {
        var prescription = await db.DonThuocs.Include(x => x.ChiTietDonThuocs)
            .FirstOrDefaultAsync(x => x.Id == donThuocId && x.MaLuotKham == luotKhamId);
        if (prescription is null) return Failure("Không tìm thấy đơn thuốc.", 404);
        if (prescription.TrangThai != TrangThaiDonThuoc.TAM) return Failure("Chỉ được sửa đơn tạm.", 409);
        db.ChiTietDonThuocs.RemoveRange(prescription.ChiTietDonThuocs);
        foreach (var line in request.Items)
        {
            var item = await db.Items.Include(x => x.DonViTinhQuyDois).FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null || !item.CanKeDon) return Failure("Mặt hàng không hợp lệ.", 409);
            if (line.SoLuongKe <= 0 || prescription.ChiTietDonThuocs.Any(x => x.MaItem == line.ItemId))
                return Failure("Số lượng không hợp lệ hoặc mặt hàng bị kê trùng.");
            var factor = line.DonViTinh.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)
                ? 1 : item.DonViTinhQuyDois.FirstOrDefault(x => x.DonVi.Equals(line.DonViTinh, StringComparison.OrdinalIgnoreCase))?.HeSo ?? 0;
            if (factor <= 0) return Failure("Đơn vị quy đổi không hợp lệ.");
            prescription.AddItem(item.Id, line.SoLuongKe * factor, line.DonGiaKe ?? item.GiaBanLe,
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
        if (CurrentUserId > 0 && prescription.MaBacSi != CurrentUserId) return Failure("Chỉ bác sĩ kê đơn mới được xác nhận.", 403);
        if (await db.DonThuocs.AnyAsync(x => x.MaLuotKham == luotKhamId && x.Id != donThuocId && x.TrangThai == TrangThaiDonThuoc.DA_DUYET))
            return Failure("Lượt khám đã có đơn chờ cấp phát.", 409);
        try { prescription.Approve(); } catch (InvalidOperationException ex) { return Failure(ex.Message, 409); }
        await db.SaveChangesAsync();
        return Success(new { id = donThuocId, trangThai = "CHO_CAP_PHAT" });
    }

    [HttpPost("{donThuocId:int}/cancel")]
    public async Task<IActionResult> Cancel(int luotKhamId, int donThuocId)
    {
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
        return Success(new { id = prescription.Id, prescription.MaLuotKham, prescription.MaBacSi,
            trangThai = prescription.TrangThai == TrangThaiDonThuoc.DA_DUYET ? "CHO_CAP_PHAT" : prescription.TrangThai.ToString(),
            prescription.GhiChu, items = prescription.ChiTietDonThuocs.Select(x => new
            { itemId = x.MaItem, itemName = x.Item.Ten, quantity = x.SoLuongKe, baseUnit = x.Item.DonViTinhCoBan,
                x.DonGiaKe, x.LieuDung, x.TanSuat, x.SoNgay, x.HuongDan }) });
    }
}
