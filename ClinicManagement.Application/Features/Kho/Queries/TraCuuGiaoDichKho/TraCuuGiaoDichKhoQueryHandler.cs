using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TraCuuGiaoDichKhoQueryHandler(
    IKhoRepository db)
    : IRequestHandler<TraCuuGiaoDichKhoQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(TraCuuGiaoDichKhoQuery request, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = db.InventoryTransactions.AsNoTracking().Where(x => !request.ItemId.HasValue || x.MaItem == request.ItemId.Value);
        if (request.FromDate.HasValue) query = query.Where(x => x.CreatedAt >= request.FromDate.Value);
        if (request.ToDate.HasValue) query = query.Where(x => x.CreatedAt <= request.ToDate.Value);
        var total = await query.CountAsync(ct);
        var data = await query.OrderByDescending(x => x.CreatedAt)
            .Skip((pageIndex - 1) * pageSize).Take(pageSize)
            .Select(x => new { id = x.Id, createdAt = x.CreatedAt, transactionType = x.LoaiGiaoDich.ToString(), referenceCode = x.MaChungTu, itemId = x.MaItem, batchNumber = x.SoLo, quantityBefore = x.SoLuongTruoc, quantityChange = x.SoLuongThayDoi, quantityAfter = x.SoLuongSau, performer = x.MaNguoiThucHien })
            .ToListAsync(ct);
        return InventoryResult.Ok(new { data, total });
    }
}
