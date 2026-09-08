using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class InventoryController
{
    [HttpGet("stock")]
    public Task<IActionResult> Stock(string? keyword, bool lowStockOnly = false, int pageIndex = 1, int pageSize = 20) =>
        Send(new LayTonKhoQuery(keyword, lowStockOnly, pageIndex, pageSize, CurrentUserId));

    [HttpGet("stock/alerts")]
    public Task<IActionResult> Alerts(int expiringWithinDays = 60) =>
        Send(new LayCanhBaoKhoQuery(expiringWithinDays, CurrentUserId));
}
