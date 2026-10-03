using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class HoanThuocBenhNhanCommandHandler(
    IKhoRepository db,
    IInventorySettings settings,
    IdempotencyHelper idempotency)
    : IRequestHandler<HoanThuocBenhNhanCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(HoanThuocBenhNhanCommand request, CancellationToken ct)
    {
        var (r, userId) = (request.Data, request.UserId);
        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, nameof(HoanThuocBenhNhanCommand));
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        if (!await db.DonThuocs.AnyAsync(x => x.Id == r.PrescriptionId, ct))
            return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);

        await using var transaction = await db.BeginTransactionAsync(ct);
        foreach (var line in r.Items)
        {
            if (line.Quantity <= 0) return InventoryResult.Error("Số lượng hoàn không hợp lệ.");
            var source = await db.TonKhos.Include(x => x.ChiTietNhapKho)
                .FirstOrDefaultAsync(x => x.MaItem == line.ItemId && x.MaKho == settings.DefaultWarehouseId
                    && x.ChiTietNhapKho.SoLo == line.BatchNumber, ct);
            if (source is null) return InventoryResult.Error("Không xác định được lô thuốc hoàn.", 409);

            var dispensed = await db.ChiTietDonThuocs
                .Where(x => x.MaDonThuoc == r.PrescriptionId && x.MaItem == line.ItemId)
                .SumAsync(x => x.SoLuongDaXuat, ct);
            if (line.Quantity > dispensed)
                return InventoryResult.Error($"Số lượng hoàn ({line.Quantity}) vượt quá số đã cấp ({dispensed}).", 409);

            if (line.Condition.Equals("SEALED", StringComparison.OrdinalIgnoreCase))
            {
                var before = source.SoLuongTon;
                source.AddQuantity(line.Quantity);
                db.Add(new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.NHAP_TRA_BENH_NHAN, MaItem = line.ItemId, MaTonKho = source.Id,
                    SoLo = line.BatchNumber, SoLuongTruoc = before, SoLuongThayDoi = line.Quantity, SoLuongSau = source.SoLuongTon,
                    MaChungTu = $"TH-{r.PrescriptionId}", MaNguoiThucHien = userId, IdempotencyKey = r.IdempotencyKey, GhiChu = r.Reason
                });
            }
            else
            {
                db.Add(new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.HUY, MaItem = line.ItemId, MaTonKho = source.Id, SoLo = line.BatchNumber,
                    MaChungTu = $"TH-{r.PrescriptionId}", MaNguoiThucHien = userId, IdempotencyKey = r.IdempotencyKey,
                    GhiChu = $"{r.Reason}: {line.Condition}"
                });
            }
        }
        var result = new { prescriptionId = r.PrescriptionId, status = "DA_XU_LY" };
        await idempotency.SaveAsync(r.IdempotencyKey, nameof(HoanThuocBenhNhanCommand), result, userId);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(result);
    }
}
