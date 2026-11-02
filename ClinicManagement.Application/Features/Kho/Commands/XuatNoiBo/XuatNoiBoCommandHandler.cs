using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class XuatNoiBoCommandHandler(
    IKhoRepository db,
    IInventorySettings settings,
    IdempotencyHelper idempotency)
    : IRequestHandler<XuatNoiBoCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(XuatNoiBoCommand request, CancellationToken ct)
    {
        var (r, userId) = (request.Data, request.UserId);
        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, LoaiXuatKho.XUAT_THU_THUAT.ToString());
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        await using var transaction = await db.BeginTransactionAsync(ct);
        var lines = r.Items.ToList();
        if (lines.Count == 0) return InventoryResult.Error("Phiếu xuất phải có ít nhất một dòng.");

        var export = new PhieuXuatKho
        {
            MaPhieu = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            LoaiXuat = LoaiXuatKho.XUAT_THU_THUAT,
            MaKhoXuat = settings.DefaultWarehouseId,
            MaNguoiXuat = userId,
            GhiChu = r.Note ?? string.Empty
        };

        foreach (var line in lines)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive, ct);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại.", 404);

            decimal need = await ToBaseQuantity(db, item, line.Quantity, line.Unit, ct);
            var effectivePrice = line.UnitPrice ?? item.GiaBanLe;

            if (line.UnitPrice.HasValue && line.UnitPrice != item.GiaBanLe)
            {
                db.Add(new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.XUAT_BAN_LE, MaItem = line.ItemId,
                    MaChungTu = $"GIA-OVERRIDE-{DateTime.UtcNow:yyyyMMddHHmmssfff}", MaNguoiThucHien = userId,
                    GhiChu = $"Giá bán {effectivePrice} khác giá danh mục {item.GiaBanLe}"
                });
            }

            var batches = await db.TonKhos.Include(x => x.ChiTietNhapKho)
                .Where(x => x.MaKho == settings.DefaultWarehouseId && x.MaItem == line.ItemId && x.SoLuongTon > 0
                    && (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(x => x.ChiTietNhapKho.HanSuDung)
                .ToListAsync(ct);

            if (batches.Sum(x => x.SoLuongTon) < need)
                return InventoryResult.Error($"Không đủ tồn kho cho {item.Ma}.", 409);

            foreach (var batch in batches)
            {
                if (need <= 0) break;
                var quantity = Math.Min(need, batch.SoLuongTon);
                var before = batch.SoLuongTon;
                batch.SubtractQuantity(quantity);
                export.ChiTietXuatKhos.Add(new ChiTietXuatKho { ChiTietNhapKho = batch.ChiTietNhapKho, SoLuongXuat = quantity, DonGiaXuat = effectivePrice });
                db.Add(new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.XUAT_THU_THUAT, MaItem = line.ItemId, MaTonKho = batch.Id,
                    SoLo = batch.ChiTietNhapKho.SoLo, SoLuongTruoc = before, SoLuongThayDoi = -quantity,
                    SoLuongSau = batch.SoLuongTon, MaChungTu = export.MaPhieu, MaNguoiThucHien = userId, IdempotencyKey = r.IdempotencyKey
                });
                need -= quantity;
            }
        }

        db.Add(export);
        await db.SaveChangesAsync(ct);
        var result = new { exportReceiptId = export.Id, referenceCode = export.MaPhieu };
        await idempotency.SaveAsync(r.IdempotencyKey, LoaiXuatKho.XUAT_THU_THUAT.ToString(), result, userId);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(result);
    }

    private static async Task<decimal> ToBaseQuantity(IKhoRepository db, Item item, decimal quantity, string? unit, CancellationToken ct)
    {
        if (quantity <= 0) return 0;
        if (string.IsNullOrWhiteSpace(unit) || unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)) return quantity;
        var conversion = await db.DonViTinhQuyDois.FirstOrDefaultAsync(x => x.MaItem == item.Id && x.DonVi == unit, ct);
        return conversion is null ? 0 : quantity * conversion.HeSo;
    }
}
