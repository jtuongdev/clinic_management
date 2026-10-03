using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.API.Authorization;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoCongNoTongHop;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoDoanhThu;
using ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoThuChi;
using ClinicManagement.Application.Features.FinanceReports.Queries.XuatBaoCaoTaiChinh;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/finance-reports")]
[ClinicalAuthorize("billing", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed class FinanceReportsController(IMediator mediator) : BaseController
{
    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenueReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? groupBy = "day",
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayBaoCaoDoanhThuQuery(facilityId, departmentId, fromDate, toDate, groupBy),
            cancellationToken));

    [HttpGet("debts")]
    public async Task<IActionResult> GetDebtSummaryReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] DateTime? asOfDate = null,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayBaoCaoCongNoTongHopQuery(facilityId, asOfDate),
            cancellationToken));

    [HttpGet("cashflow")]
    public async Task<IActionResult> GetCashflowReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayBaoCaoThuChiLoiNhuanQuery(facilityId, fromDate, toDate),
            cancellationToken));

    [HttpGet("export")]
    public async Task<IActionResult> ExportFinancialReport(
        [FromQuery] string reportType = "revenue",
        [FromQuery] int? facilityId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string format = "csv",
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new XuatBaoCaoTaiChinhQuery
            {
                ReportType = reportType,
                FacilityId = facilityId,
                FromDate = fromDate,
                ToDate = toDate,
                Format = format
            },
            cancellationToken);

        return File(result.FileContent, result.ContentType, result.FileName);
    }
}
