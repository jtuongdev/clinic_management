using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.SystemReports.Queries.GetSystemFinanceReport;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class SystemReportsController
{
    /// <summary>
    /// Financial, Hospital Fees & Payment Methods Report
    /// </summary>
    [HttpGet("finance")]
    public async Task<IActionResult> GetFinanceReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? groupBy = "day",
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetSystemFinanceReportQuery(facilityId, departmentId, fromDate, toDate, groupBy),
            cancellationToken);
        return Success(result);
    }
}
