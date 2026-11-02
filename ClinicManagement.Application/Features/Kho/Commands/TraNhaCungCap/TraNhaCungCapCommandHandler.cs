using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TraNhaCungCapCommandHandler(
    IKhoRepository db,
    IdempotencyHelper idempotency)
    : IRequestHandler<TraNhaCungCapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TraNhaCungCapCommand request, CancellationToken ct)
    {
        var (r, userId) = (request.Data, request.UserId);
        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, LoaiXuatKho.TRA_NCC.ToString());
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        await using var transaction = await db.BeginTransactionAsync(ct);
        var stock = await db.TonKhos.Include(x => x.ChiTietNhapKho).FirstOrDefaultAsync(x => x.Id == r.StockId, ct);
        if (stock is null) return InventoryResult.Error("Không tìm thấy lô tồn.", 404);
        if (r.Quantity <= 0 || r.Quantity > stock.SoLuongTon) return InventoryResult.Error("Số lượng xuất không hợp lệ.", 409);

        var before = stock.SoLuongTon;
        stock.SubtractQuantity(r.Quantity);
        var reference = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
        db.Add(new InventoryTransaction
        {
            LoaiGiaoDich = LoaiGiaoDichKho.TRA_NCC, MaItem = stock.MaItem, MaTonKho = stock.Id,
            SoLo = stock.ChiTietNhapKho.SoLo, SoLuongTruoc = before, SoLuongThayDoi = -r.Quantity,
            SoLuongSau = stock.SoLuongTon, MaChungTu = reference, MaNguoiThucHien = userId,
            IdempotencyKey = r.IdempotencyKey, GhiChu = r.Reason
        });
        await db.SaveChangesAsync(ct);
        var result = new { stockId = stock.Id, referenceCode = reference, quantity = r.Quantity };
        await idempotency.SaveAsync(r.IdempotencyKey, LoaiXuatKho.TRA_NCC.ToString(), result, userId);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(result);
    }
}
