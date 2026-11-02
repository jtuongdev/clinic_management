using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TaoKiemKeCommandHandler(
    IKhoRepository db,
    IdempotencyHelper idempotency)
    : IRequestHandler<TaoKiemKeCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TaoKiemKeCommand request, CancellationToken ct)
    {
        var (r, userId) = (request.Data, request.UserId);
        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, nameof(TaoKiemKeCommand));
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        var stocktake = new Stocktake
        {
            ReferenceCode = $"KK-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            Note = r.Note ?? string.Empty,
            CreatedByUserId = userId
        };
        db.Add(stocktake);
        await db.SaveChangesAsync(ct);

        var result = new { id = stocktake.Id, referenceCode = stocktake.ReferenceCode, status = stocktake.Status.ToString() };
        await idempotency.SaveAsync(r.IdempotencyKey, nameof(TaoKiemKeCommand), result, userId);
        return InventoryResult.Ok(result);
    }
}
