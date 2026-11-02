using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.SystemReports.Queries.GetSystemClinicalReport;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class SystemReportsController
{
    /// <summary>
    /// Clinical Services, Laboratory Orders & Top ICD-10 Report
    /// </summary>
    [HttpGet("clinical")]
    public async Task<IActionResult> GetClinicalReport(
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? shift = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetSystemClinicalReportQuery(facilityId, departmentId, fromDate, toDate, shift),
            cancellationToken);
        return Success(result);
    }
}
