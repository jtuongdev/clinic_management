using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.SystemReports.Queries.GetSystemInventoryReport;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class SystemReportsController
{
    /// <summary>
    /// Pharmacy & Stock Inventory Report
    /// </summary>
    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventoryReport(
        [FromQuery] int? facilityId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetSystemInventoryReportQuery(facilityId),
            cancellationToken);
        return Success(result);
    }
}
