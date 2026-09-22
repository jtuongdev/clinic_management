using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Queries.DanhSachNhaCungCap;
using ClinicManagement.Application.Features.Kho.Commands.TaoNhaCungCap;
using ClinicManagement.Application.Features.Kho.Commands.CapNhatNhaCungCap;
using ClinicManagement.Application.Features.Kho.Commands.DoiTrangThaiNhaCungCap;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public partial class InventoryController
{
    [HttpGet("suppliers")]
    public Task<IActionResult> GetSuppliers([FromQuery] string? keyword, [FromQuery] TrangThaiNhaCungCap? status, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        => Send(new DanhSachNhaCungCapQuery(keyword, status, pageIndex, pageSize, CurrentUserId));

    [HttpPost("suppliers")]
    public Task<IActionResult> CreateSupplier([FromBody] NhaCungCapRequest request)
        => Send(new TaoNhaCungCapCommand(request, CurrentUserId));

    [HttpPut("suppliers/{id}")]
    public Task<IActionResult> UpdateSupplier(int id, [FromBody] NhaCungCapRequest request)
        => Send(new CapNhatNhaCungCapCommand(id, request, CurrentUserId));

    [HttpPost("suppliers/{id}/toggle-status")]
    public Task<IActionResult> ToggleSupplierStatus(int id)
        => Send(new DoiTrangThaiNhaCungCapCommand(id, CurrentUserId));
}
