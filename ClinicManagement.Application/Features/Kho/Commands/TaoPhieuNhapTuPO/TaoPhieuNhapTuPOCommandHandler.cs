using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Commands.TaoPhieuNhapTuPO;

public sealed class TaoPhieuNhapTuPOCommandHandler(
    IKhoRepository db,
    IdempotencyHelper idempotency)
    : IRequestHandler<TaoPhieuNhapTuPOCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TaoPhieuNhapTuPOCommand request, CancellationToken ct)
    {
        var (r, userId) = (request.Data, request.UserId);
        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, nameof(TaoPhieuNhapTuPOCommand));
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        var po = await db.DonDatHangs.Include(x => x.ChiTietDonDatHangs).FirstOrDefaultAsync(x => x.Id == r.PurchaseOrderId && !x.IsDeleted, ct);
        if (po is null) return InventoryResult.Error("Không tìm thấy đơn đặt hàng.", 404);
        if (po.TrangThai != TrangThaiDonDatHang.DA_DAT && po.TrangThai != TrangThaiDonDatHang.GIAO_MOT_PHAN)
            return InventoryResult.Error("Đơn đặt hàng không ở trạng thái chờ giao hàng.", 409);

        var linesToImport = r.Lines?.Where(l => l.Quantity > 0).ToList();
        if (linesToImport is null || linesToImport.Count == 0)
            return InventoryResult.Error("Phiếu nhập từ PO phải có ít nhất một mặt hàng với số lượng nhận lớn hơn 0.");

        var supplier = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == po.MaNhaCungCap, ct);
        if (supplier is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp.", 404);
        if (supplier.TrangThai != TrangThaiNhaCungCap.HoatDong) return InventoryResult.Error("Nhà cung cấp đã ngừng hợp tác.", 409);

        var warehouseId = r.WarehouseId.HasValue && r.WarehouseId.Value > 0 ? r.WarehouseId.Value : po.MaKho;
        var warehouse = await db.Khos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == warehouseId, ct);
        if (warehouse is null) return InventoryResult.Error("Không tìm thấy kho tiếp nhận hợp lệ.", 409);

        await using var transaction = await db.BeginTransactionAsync(ct);
        var receipt = new PhieuNhapKho
        {
            MaPhieu = $"PN-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            MaCoSo = warehouse.MaCoSo,
            MaKho = warehouseId,
            MaNhaCungCap = po.MaNhaCungCap,
            MaDonDatHang = po.Id,
            NgayNhap = r.ReceivedAt,
            MaNguoiNhap = userId,
            GhiChu = string.IsNullOrWhiteSpace(r.Note)
                ? $"Nhập kho theo đơn đặt hàng #{po.MaDonDatHang}"
                : $"{r.Note.Trim()} (Nhập theo PO #{po.MaDonDatHang})",
            NhaCungCap = supplier,
            DonDatHang = po
        };

        foreach (var line in linesToImport)
        {
            var poDetail = po.ChiTietDonDatHangs.FirstOrDefault(d => d.Id == line.PoDetailId);
            if (poDetail is null) return InventoryResult.Error($"Dòng chi tiết đơn đặt hàng #{line.PoDetailId} không tồn tại trên PO này.");

            var remaining = poDetail.SoLuongConLai;
            if (line.Quantity > remaining)
                return InventoryResult.Error($"Số lượng nhận của mặt hàng #{poDetail.MaItem} ({line.Quantity}) vượt quá số lượng còn lại của đơn đặt hàng ({remaining}).");

            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive, ct);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);
            if (string.IsNullOrWhiteSpace(line.BatchNumber)) return InventoryResult.Error($"Số lô của mặt hàng '{item.Ten}' không được để trống.");
            if (item.LoaiItem == LoaiItem.THUOC && (!line.ExpiryDate.HasValue || line.ExpiryDate.Value.Date <= DateTime.UtcNow.Date))
                return InventoryResult.Error($"Thuốc '{item.Ten}' chưa có hạn dùng hoặc hạn dùng không hợp lệ.");

            var (baseQty, basePrice, lineTotal) = await CalculateImportQty(db, item, line.Quantity, line.PurchasePrice, line.Unit, ct);
            if (baseQty <= 0) return InventoryResult.Error($"Số lượng hoặc đơn vị quy đổi của mặt hàng '{item.Ten}' không hợp lệ.");

            var detail = new ChiTietNhapKho { Item = item, MaChiTietDonDatHang = poDetail.Id, ChiTietDonDatHang = poDetail, SoLuong = baseQty, DonGiaNhap = basePrice, SoLo = line.BatchNumber.Trim(), HanSuDung = line.ExpiryDate };
            receipt.ChiTietNhapKhos.Add(detail);
            receipt.TongTien += lineTotal;
            poDetail.SoLuongDaNhap += line.Quantity;
        }

        po.RecalculateStatus();
        receipt.TrangThai = r.SaveDraft ? TrangThaiPhieuNhap.CHO_DUYET : TrangThaiPhieuNhap.DA_NHAP;
        db.Add(receipt);
        await db.SaveChangesAsync(ct);

        if (!r.SaveDraft)
        {
            foreach (var detail in receipt.ChiTietNhapKhos)
            {
                var stock = new TonKho { MaKho = warehouseId, MaItem = detail.MaItem, MaChiTietNhap = detail.Id, SoLuongTon = detail.SoLuong, NgayCapNhatCuoi = DateTime.UtcNow };
                db.Add(stock);
                db.Add(new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.NHAP, MaItem = detail.MaItem, TonKho = stock,
                    SoLo = detail.SoLo, SoLuongThayDoi = detail.SoLuong, SoLuongSau = detail.SoLuong,
                    MaChungTu = receipt.MaPhieu, MaNguoiThucHien = userId, IdempotencyKey = r.IdempotencyKey ?? string.Empty
                });
            }
            await db.SaveChangesAsync(ct);
        }

        var result = new { id = receipt.Id, referenceCode = receipt.MaPhieu, status = receipt.TrangThai.ToString(), purchaseOrderId = po.Id, purchaseOrderStatus = po.TrangThai.ToString() };
        await idempotency.SaveAsync(r.IdempotencyKey, nameof(TaoPhieuNhapTuPOCommand), result, userId);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(result);
    }

    private static async Task<(decimal baseQuantity, decimal basePrice, decimal lineTotal)> CalculateImportQty(
        IKhoRepository db, Item item, decimal quantity, decimal purchasePrice, string? unit, CancellationToken ct)
    {
        if (quantity <= 0 || purchasePrice < 0) return (0, 0, 0);
        decimal factor = 1m;
        if (!string.IsNullOrWhiteSpace(unit) && !unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase))
        {
            var conversion = await db.DonViTinhQuyDois.FirstOrDefaultAsync(x => x.MaItem == item.Id && x.DonVi == unit, ct);
            if (conversion is null || conversion.HeSo <= 0) return (0, 0, 0);
            factor = conversion.HeSo;
        }
        return (quantity * factor, purchasePrice / factor, quantity * purchasePrice);
    }
}
