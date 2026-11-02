using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.SystemReports;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoDoanhThu;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoThuChi;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemFinanceReport;

public sealed class GetSystemFinanceReportQueryHandler(
    IMediator mediator,
    IHoaDonRepository hoaDonRepo)
    : IRequestHandler<GetSystemFinanceReportQuery, SystemReportsFinanceDto>
{
    public async Task<SystemReportsFinanceDto> Handle(
        GetSystemFinanceReportQuery request,
        CancellationToken cancellationToken)
    {
        var from = (request.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var to = (request.ToDate ?? DateTime.UtcNow).Date.AddDays(1);

        var revenue = await mediator.Send(
            new LayBaoCaoDoanhThuQuery(request.FacilityId, request.DepartmentId, request.FromDate, request.ToDate, request.GroupBy),
            cancellationToken);

        var cashflow = await mediator.Send(
            new LayBaoCaoThuChiLoiNhuanQuery(request.FacilityId, request.FromDate, request.ToDate),
            cancellationToken);

        var invoiceQuery = hoaDonRepo.GetQueryable().AsNoTracking()
            .Where(h => !h.IsDeleted);

        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
            invoiceQuery = invoiceQuery.Where(h => h.MaCoSo == request.FacilityId.Value);

        var paymentMethods = await invoiceQuery
            .SelectMany(h => h.PhieuThus)
            .Where(pt => pt.NgayThu >= from && pt.NgayThu < to)
            .GroupBy(pt => pt.PhuongThuc)
            .Select(g => new PaymentMethodDistributionDto
            {
                Method = g.Key.ToString(),
                Amount = g.Sum(x => x.SoTien),
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);

        return new SystemReportsFinanceDto
        {
            Revenue = revenue,
            Cashflow = cashflow,
            PaymentMethods = paymentMethods
        };
    }
}
