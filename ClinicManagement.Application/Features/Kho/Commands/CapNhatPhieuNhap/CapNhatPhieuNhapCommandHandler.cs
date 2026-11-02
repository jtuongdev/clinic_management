using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class CapNhatPhieuNhapCommandHandler(
    IKhoRepository db,
    IInventorySettings settings)
    : IRequestHandler<CapNhatPhieuNhapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(CapNhatPhieuNhapCommand request, CancellationToken ct)
    {
        var (id, r, userId) = (request.Id, request.Data, request.UserId);
        var receipt = await db.PhieuNhapKhos.Include(x => x.ChiTietNhapKhos).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (receipt is null) return InventoryResult.Error("Không tìm thấy phiếu nhập.", 404);
        if (receipt.TrangThai != TrangThaiPhieuNhap.CHO_DUYET && receipt.TrangThai != TrangThaiPhieuNhap.TAM)
            return InventoryResult.Error("Chỉ có thể chỉnh sửa phiếu nhập ở trạng thái chờ duyệt hoặc tạm.", 409);

        var supplier = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == r.SupplierId, ct);
        if (supplier is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp.", 404);
        if (supplier.TrangThai != TrangThaiNhaCungCap.HoatDong) return InventoryResult.Error("Nhà cung cấp đã ngừng hợp tác.", 409);

        var items = r.Items.ToList();
        if (items.Count == 0) return InventoryResult.Error("Phiếu nhập phải có ít nhất một dòng.");

        var warehouseId = r.WarehouseId.HasValue && r.WarehouseId.Value > 0 ? r.WarehouseId.Value : settings.DefaultWarehouseId;

        await using var transaction = await db.BeginTransactionAsync(ct);
        receipt.MaNhaCungCap = r.SupplierId;
        receipt.MaKho = warehouseId;
        receipt.NgayNhap = r.ReceivedAt;
        receipt.GhiChu = r.Note ?? string.Empty;
        receipt.TongTien = 0;

        db.RemoveRange(receipt.ChiTietNhapKhos);
        receipt.ChiTietNhapKhos.Clear();

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

        if (!r.SaveDraft)
        {
            receipt.TrangThai = TrangThaiPhieuNhap.DA_NHAP;
            await db.SaveChangesAsync(ct);
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
        }
        else
        {
            receipt.TrangThai = TrangThaiPhieuNhap.CHO_DUYET;
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(new { id, referenceCode = receipt.MaPhieu, status = receipt.TrangThai.ToString() });
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
