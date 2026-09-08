using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Application.Features.Kho.Queries.DanhSachPhieuNhap;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class InventoryController
{
    [HttpGet("import-receipts")]
    public Task<IActionResult> GetImportReceipts(
        [FromQuery] string? keyword,
        [FromQuery] TrangThaiPhieuNhap? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20) =>
        Send(new DanhSachPhieuNhapQuery(
            keyword, status, fromDate, toDate, pageIndex, pageSize, CurrentUserId));

    [HttpPost("import-receipts")]
    public Task<IActionResult> Import(ImportRequest request) =>
        Send(new TaoPhieuNhapCommand(request, CurrentUserId));

    [HttpPost("import-receipts/{id:int}/approve")]
    public Task<IActionResult> ApproveImport(int id) =>
        Send(new DuyetPhieuNhapCommand(id, CurrentUserId));
}
