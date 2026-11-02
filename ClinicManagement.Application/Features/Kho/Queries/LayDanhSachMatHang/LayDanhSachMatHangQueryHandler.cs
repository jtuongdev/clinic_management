using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayDanhSachMatHangQueryHandler(
    IKhoRepository db)
    : IRequestHandler<LayDanhSachMatHangQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayDanhSachMatHangQuery request, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 1000);
        var query = db.Items.AsNoTracking().Where(x => !request.IsActive.HasValue || x.IsActive == request.IsActive.Value);
        if (request.ItemType.HasValue) query = query.Where(x => x.LoaiItem == request.ItemType.Value);
        if (!string.IsNullOrWhiteSpace(request.Keyword))
            query = query.Where(x => x.Ma.Contains(request.Keyword) || x.Ten.Contains(request.Keyword));
        var total = await query.CountAsync(ct);
        var data = await query.OrderBy(x => x.Ten).Skip((pageIndex - 1) * pageSize).Take(pageSize)
            .Select(x => new { id = x.Id, code = x.Ma, name = x.Ten, itemType = x.LoaiItem, baseUnit = x.DonViTinhCoBan, salePrice = x.GiaBanLe, minimumStock = x.TonToiThieu, isActive = x.IsActive, conversions = x.DonViTinhQuyDois.Select(c => new { unit = c.DonVi, factor = c.HeSo }) })
            .ToListAsync(ct);
        return InventoryResult.Ok(new { items = data, total });
    }
}
