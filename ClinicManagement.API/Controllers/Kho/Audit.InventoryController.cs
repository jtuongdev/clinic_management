using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class InventoryController
{
    [HttpGet("audit-transactions")]
    public Task<IActionResult> Audit(int? itemId, DateTime? fromDate, DateTime? toDate, int pageIndex = 1, int pageSize = 50) =>
        Send(new TraCuuGiaoDichKhoQuery(itemId, fromDate, toDate, pageIndex, pageSize, CurrentUserId));
}
