using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayDanhSachHoaDonQueryHandler(IHoaDonRepository repository)
    : IRequestHandler<LayDanhSachHoaDonQuery, PagedResult<HoaDonListDto>>
{
    public async Task<PagedResult<HoaDonListDto>> Handle(
        LayDanhSachHoaDonQuery request,
        CancellationToken cancellationToken)
    {
        var pageIndex = Math.Max(request.PageIndex, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await repository.GetByCoSoAsync(
            request.FacilityId,
            request.FromDate,
            request.ToDate,
            request.Status,
            request.Keyword,
            pageIndex,
            pageSize,
            cancellationToken);

        return new PagedResult<HoaDonListDto>
        {
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalCount = totalCount,
            Items = items.Select(BillingMapper.ToListItem).ToList()
        };
    }
}
