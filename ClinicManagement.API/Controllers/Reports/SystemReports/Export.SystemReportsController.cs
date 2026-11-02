using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.SystemReports.Queries.ExportSystemReports;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class SystemReportsController
{
    /// <summary>
    /// Export Consolidated System Report to UTF-8 CSV/Excel
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportReport(
        [FromQuery] string tab = "overview",
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ExportSystemReportsQuery(tab, facilityId, departmentId, fromDate, toDate),
            cancellationToken);
        return File(result.FileContents, result.ContentType, result.FileName);
    }
}
