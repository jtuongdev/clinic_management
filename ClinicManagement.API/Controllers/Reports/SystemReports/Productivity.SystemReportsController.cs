using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.SystemReports.Queries.GetSystemProductivityReport;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class SystemReportsController
{
    /// <summary>
    /// Doctor Productivity & Examination Room Utilization Report
    /// </summary>
    [HttpGet("productivity")]
    public async Task<IActionResult> GetProductivityReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetSystemProductivityReportQuery(facilityId, departmentId, fromDate, toDate),
            cancellationToken);
        return Success(result);
    }
}
