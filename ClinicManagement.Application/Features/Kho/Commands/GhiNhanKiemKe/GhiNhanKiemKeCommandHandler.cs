using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class GhiNhanKiemKeCommandHandler(
    IKhoRepository db,
    IInventorySettings settings)
    : IRequestHandler<GhiNhanKiemKeCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(GhiNhanKiemKeCommand request, CancellationToken ct)
    {
        var (id, r) = (request.Id, request.Data);
        var stocktake = await db.Stocktakes.Include(x => x.Counts).FirstOrDefaultAsync(x => x.Id == id, ct);
        var stock = await db.TonKhos.FirstOrDefaultAsync(x => x.Id == r.StockId && x.MaKho == settings.DefaultWarehouseId, ct);
        if (stocktake is null || stock is null) return InventoryResult.Error("Không tìm thấy đợt kiểm kê hoặc lô tồn.", 404);
        if (stocktake.Status != TrangThaiKiemKe.MOI_TAO || r.ActualQuantity < 0) return InventoryResult.Error("Đợt kiểm kê không còn mở.", 409);

        var count = stocktake.Counts.FirstOrDefault(x => x.MaTonKho == r.StockId);
        if (count is null)
            stocktake.Counts.Add(new StocktakeCount { MaTonKho = stock.Id, SystemQuantity = stock.SoLuongTon, ActualQuantity = r.ActualQuantity, Reason = r.Reason ?? string.Empty });
        else
        {
            count.ActualQuantity = r.ActualQuantity;
            count.Reason = r.Reason ?? string.Empty;
        }
        await db.SaveChangesAsync(ct);
        return InventoryResult.Ok(new { stocktakeId = id, stockId = r.StockId, actualQuantity = r.ActualQuantity });
    }
}
