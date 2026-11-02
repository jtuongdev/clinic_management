using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class ChotKiemKeCommandHandler(
    IKhoRepository db,
    IdempotencyHelper idempotency)
    : IRequestHandler<ChotKiemKeCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(ChotKiemKeCommand request, CancellationToken ct)
    {
        var (id, r, userId) = (request.Id, request.Data, request.UserId);
        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, nameof(ChotKiemKeCommand));
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        var stocktake = await db.Stocktakes.Include(x => x.Counts).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (stocktake is null) return InventoryResult.Error("Không tìm thấy đợt kiểm kê.", 404);

        if (stocktake.Status == TrangThaiKiemKe.MOI_TAO)
        {
            foreach (var countReq in r.Counts)
            {
                var stock = await db.TonKhos.FirstOrDefaultAsync(x => x.Id == countReq.StockId, ct);
                if (stock is null) throw new InvalidOperationException("Lô tồn kiểm kê không tồn tại.");
                var count = stocktake.Counts.FirstOrDefault(x => x.MaTonKho == countReq.StockId);
                if (count is null) stocktake.Counts.Add(new StocktakeCount { MaTonKho = stock.Id, SystemQuantity = stock.SoLuongTon, ActualQuantity = countReq.ActualQuantity, Reason = countReq.Reason ?? string.Empty });
                else { count.ActualQuantity = countReq.ActualQuantity; count.Reason = countReq.Reason ?? string.Empty; }
            }
        }

        try
        {
            if (stocktake.Status == TrangThaiKiemKe.MOI_TAO) stocktake.Submit();
            stocktake.Approve(userId);
        }
        catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }

        await using var transaction = await db.BeginTransactionAsync(ct);
        foreach (var count in stocktake.Counts)
        {
            var stock = await db.TonKhos.Include(x => x.ChiTietNhapKho).FirstOrDefaultAsync(x => x.Id == count.MaTonKho, ct);
            if (stock is null || count.ActualQuantity < 0) return InventoryResult.Error("Dữ liệu kiểm kê không hợp lệ.", 409);
            var before = stock.SoLuongTon;
            var difference = count.ActualQuantity - before;
            if (difference == 0) continue;
            if (difference > 0) stock.AddQuantity(difference); else stock.SubtractQuantity(-difference);
            db.Add(new InventoryTransaction
            {
                LoaiGiaoDich = LoaiGiaoDichKho.DIEU_CHINH, MaItem = stock.MaItem, MaTonKho = stock.Id,
                SoLo = stock.ChiTietNhapKho.SoLo, SoLuongTruoc = before, SoLuongThayDoi = difference,
                SoLuongSau = stock.SoLuongTon, MaChungTu = stocktake.ReferenceCode, MaNguoiThucHien = userId,
                IdempotencyKey = r.IdempotencyKey, GhiChu = count.Reason
            });
        }
        var result = new { id, status = stocktake.Status.ToString() };
        await idempotency.SaveAsync(r.IdempotencyKey, nameof(ChotKiemKeCommand), result, userId);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(result);
    }
}
