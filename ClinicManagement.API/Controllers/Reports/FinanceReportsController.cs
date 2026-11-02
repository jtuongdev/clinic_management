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

/// <summary>
/// Phân hệ Báo cáo Tài chính (Finance Reports) - Doanh thu, Công nợ tổng hợp & Thu chi dòng tiền
/// Route: api/finance-reports
/// Quyền: billing (XEM, CO_SO)
/// </summary>
[ApiController]
[Route("api/finance-reports")]
[ClinicalAuthorize("billing", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed class FinanceReportsController(IMediator mediator) : BaseController
{
    /// <summary>
    /// Lấy báo cáo phân tích doanh thu theo ngày/tháng/năm
    /// </summary>
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

    /// <summary>
    /// Lấy báo cáo tổng hợp tình hình công nợ bệnh nhân
    /// </summary>
    [HttpGet("debts")]
    public async Task<IActionResult> GetDebtSummaryReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] DateTime? asOfDate = null,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayBaoCaoCongNoTongHopQuery(facilityId, asOfDate),
            cancellationToken));

    /// <summary>
    /// Lấy báo cáo thu chi dòng tiền và lợi nhuận gộp
    /// </summary>
    [HttpGet("cashflow")]
    public async Task<IActionResult> GetCashflowReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayBaoCaoThuChiLoiNhuanQuery(facilityId, fromDate, toDate),
            cancellationToken));

    /// <summary>
    /// Xuất báo cáo tài chính ra file Excel / CSV
    /// </summary>
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
