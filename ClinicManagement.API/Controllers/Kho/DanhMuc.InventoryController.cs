using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    [HttpGet("items")]
    public Task<IActionResult> Items(string? keyword, LoaiItem? itemType, bool? isActive, int pageIndex = 1, int pageSize = 20) =>
        Send(new LayDanhSachMatHangQuery(keyword, itemType, isActive, pageIndex, pageSize, CurrentUserId));

    [HttpPost("items")]
    public Task<IActionResult> CreateItem(ItemRequest request) =>
        Send(new TaoMatHangCommand(request, CurrentUserId));

    [HttpPut("items/{id:int}")]
    public Task<IActionResult> UpdateItem(int id, ItemRequest request) =>
        Send(new CapNhatMatHangCommand(id, request, CurrentUserId));

    [HttpPost("items/{id:int}/toggle-status")]
    public Task<IActionResult> ToggleItem(int id) =>
        Send(new DoiTrangThaiMatHangCommand(id, CurrentUserId));
}
