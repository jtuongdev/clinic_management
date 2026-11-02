using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TrinhDuyetKiemKeCommandHandler(
    IKhoRepository db)
    : IRequestHandler<TrinhDuyetKiemKeCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TrinhDuyetKiemKeCommand request, CancellationToken ct)
    {
        var stocktake = await db.Stocktakes.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (stocktake is null) return InventoryResult.Error("Không tìm thấy đợt kiểm kê.", 404);
        try { stocktake.Submit(request.UserId); }
        catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }
        await db.SaveChangesAsync(ct);
        return InventoryResult.Ok(new { id = request.Id, status = stocktake.Status.ToString() });
    }
}
