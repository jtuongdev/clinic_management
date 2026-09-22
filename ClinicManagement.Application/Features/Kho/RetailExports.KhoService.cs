using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;


namespace ClinicManagement.Application.Features.Kho;

// Xử lý bán/cấp thuốc theo lượt khám và các phiếu xuất dùng nội bộ.
public sealed partial class KhoService
{
        public Task<InventoryResult> InternalUse(ExportRequest request) => Export(request, LoaiXuatKho.XUAT_THU_THUAT, LoaiGiaoDichKho.XUAT_THU_THUAT);

    private async Task<InventoryResult> Export(ExportRequest request, LoaiXuatKho exportType, LoaiGiaoDichKho transactionType)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, exportType.ToString());
        if (replay is not null) return replay;
        await using var transaction = await db.BeginTransactionAsync();
        var lines = request.Items.ToList();
        if (lines.Count == 0) return InventoryResult.Error("Phiếu xuất phải có ít nhất một dòng.");
        var export = new PhieuXuatKho { MaPhieu = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}", LoaiXuat = exportType,
            MaKhoXuat = DefaultWarehouseId, MaNguoiXuat = UserId, GhiChu = request.Note ?? string.Empty };
        foreach (var line in lines)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại.", 404);
            var need = await ToBaseQuantity(item, line.Quantity, line.Unit);
            var effectivePrice = line.UnitPrice ?? item.GiaBanLe;
            // Audit khi giá bán khác giá danh mục (§18 — sửa giá phải ghi audit)
            if (line.UnitPrice.HasValue && line.UnitPrice != item.GiaBanLe)
            {
                db.Add(new InventoryTransaction {
                    LoaiGiaoDich = LoaiGiaoDichKho.XUAT_BAN_LE,
                    MaItem = line.ItemId, MaChungTu = $"GIA-OVERRIDE-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                    MaNguoiThucHien = UserId,
                    GhiChu = $"Giá bán {effectivePrice} khác giá danh mục {item.GiaBanLe}" });
            }
            var batches = await db.TonKhos.Include(x => x.ChiTietNhapKho).Where(x => x.MaKho == DefaultWarehouseId &&
                x.MaItem == line.ItemId && x.SoLuongTon > 0 &&
                (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(x => x.ChiTietNhapKho.HanSuDung).ToListAsync();
            if (batches.Sum(x => x.SoLuongTon) < need) return InventoryResult.Error($"Không đủ tồn kho cho {item.Ma}.", 409);
            foreach (var batch in batches)
            {
                var quantity = Math.Min(need, batch.SoLuongTon); var before = batch.SoLuongTon; batch.SubtractQuantity(quantity);
                export.ChiTietXuatKhos.Add(new ChiTietXuatKho { ChiTietNhapKho = batch.ChiTietNhapKho,
                    SoLuongXuat = quantity, DonGiaXuat = effectivePrice });
                db.Add(new InventoryTransaction { LoaiGiaoDich = transactionType, MaItem = line.ItemId,
                    MaTonKho = batch.Id, SoLo = batch.ChiTietNhapKho.SoLo, SoLuongTruoc = before,
                    SoLuongThayDoi = -quantity, SoLuongSau = batch.SoLuongTon, MaChungTu = export.MaPhieu,
                    MaNguoiThucHien = UserId, IdempotencyKey = request.IdempotencyKey });
                need -= quantity; if (need == 0) break;
            }
        }

        db.Add(export); await db.SaveChangesAsync();
        var result = new { exportReceiptId = export.Id, referenceCode = export.MaPhieu };
        await SaveReplayAsync(request.IdempotencyKey, exportType.ToString(), result);
        await transaction.CommitAsync();
        return InventoryResult.Ok(result);
    }

}
