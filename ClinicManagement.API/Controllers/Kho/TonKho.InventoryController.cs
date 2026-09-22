using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    [HttpGet("stock")]
    public Task<IActionResult> Stock(
        string? keyword,
        bool lowStockOnly = false,
        string? stockStatus = null,
        int? warehouseId = null,
        int pageIndex = 1,
        int pageSize = 20) =>
        Send(new LayTonKhoQuery(keyword, lowStockOnly, pageIndex, pageSize, CurrentUserId, warehouseId, stockStatus));

    [HttpGet("stock/alerts")]
    public Task<IActionResult> Alerts(int expiringWithinDays = 60) =>
        Send(new LayCanhBaoKhoQuery(expiringWithinDays, CurrentUserId));
}
