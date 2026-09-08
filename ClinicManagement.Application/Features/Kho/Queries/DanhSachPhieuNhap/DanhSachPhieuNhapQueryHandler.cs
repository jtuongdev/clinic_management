using ClinicManagement.Application.Common.Interfaces;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Queries.DanhSachPhieuNhap;

public sealed class DanhSachPhieuNhapQueryHandler(IKhoService service)
    : IRequestHandler<DanhSachPhieuNhapQuery, InventoryResult>
{
    public Task<InventoryResult> Handle(
        DanhSachPhieuNhapQuery request,
        CancellationToken cancellationToken)
    {
        service.SetUserId(request.UserId);
        return service.ImportReceipts(
            request.Keyword,
            request.Status,
            request.FromDate,
            request.ToDate,
            request.PageIndex,
            request.PageSize);
    }
}
