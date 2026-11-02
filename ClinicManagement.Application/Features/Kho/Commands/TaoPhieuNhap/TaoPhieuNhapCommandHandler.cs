using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TaoPhieuNhapCommandHandler(
    IKhoRepository db,
    IInventorySettings settings,
    IdempotencyHelper idempotency)
    : IRequestHandler<TaoPhieuNhapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TaoPhieuNhapCommand request, CancellationToken ct)
    {
        var r = request.Data;
        var userId = request.UserId;

        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, nameof(TaoPhieuNhapCommand));
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        var supplier = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == r.SupplierId, ct);
        if (supplier is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp.", 404);
        if (supplier.TrangThai != TrangThaiNhaCungCap.HoatDong) return InventoryResult.Error("Nhà cung cấp đã ngừng hợp tác.", 409);

        var items = r.Items.ToList();
        if (items.Count == 0) return InventoryResult.Error("Phiếu nhập phải có ít nhất một dòng.");

        var warehouseId = r.WarehouseId.HasValue && r.WarehouseId.Value > 0 ? r.WarehouseId.Value : settings.DefaultWarehouseId;
        var warehouse = await db.Khos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == warehouseId, ct);
        if (warehouse is null)
        {
            warehouse = await db.Khos.AsNoTracking().Where(x => x.TrangThai == TrangThaiKho.HoatDong).OrderBy(x => x.Id).FirstOrDefaultAsync(ct);
            warehouseId = warehouse?.Id ?? warehouseId;
        }
        if (warehouse is null) return InventoryResult.Error("Chưa cấu hình kho nhập hợp lệ trong hệ thống.", 409);
        if (warehouse.TrangThai != TrangThaiKho.HoatDong) return InventoryResult.Error("Kho nhập đang ngừng hoạt động.", 409);

        await using var transaction = await db.BeginTransactionAsync(ct);
        var receipt = new PhieuNhapKho
        {
            MaPhieu = $"PN-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            MaCoSo = warehouse.MaCoSo,
            MaKho = warehouseId,
            MaNhaCungCap = r.SupplierId,
            NgayNhap = r.ReceivedAt,
            MaNguoiNhap = userId,
            GhiChu = r.Note ?? string.Empty,
            NhaCungCap = supplier
        };

        foreach (var line in items)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive, ct);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);
            if (string.IsNullOrWhiteSpace(line.BatchNumber)) return InventoryResult.Error($"Số lô của mặt hàng '{item.Ten}' không được để trống.");
            if (item.LoaiItem == LoaiItem.THUOC && (!line.ExpiryDate.HasValue || line.ExpiryDate.Value.Date <= DateTime.UtcNow.Date))
                return InventoryResult.Error($"Thuốc '{item.Ten}' đã hết hạn sử dụng hoặc hạn dùng không hợp lệ.");

            var (baseQty, basePrice, lineTotal) = await CalculateImportQty(db, item, line.Quantity, line.PurchasePrice, line.Unit, ct);
            if (baseQty <= 0) return InventoryResult.Error($"Số lượng hoặc đơn vị quy đổi của mặt hàng '{item.Ten}' không hợp lệ.");

            var detail = new ChiTietNhapKho { Item = item, SoLuong = baseQty, DonGiaNhap = basePrice, SoLo = line.BatchNumber.Trim(), HanSuDung = line.ExpiryDate };
            receipt.ChiTietNhapKhos.Add(detail);
            receipt.TongTien += lineTotal;
        }

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

        var result = new { id = receipt.Id, referenceCode = receipt.MaPhieu, status = receipt.TrangThai.ToString() };
        await idempotency.SaveAsync(r.IdempotencyKey, nameof(TaoPhieuNhapCommand), result, userId);
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
