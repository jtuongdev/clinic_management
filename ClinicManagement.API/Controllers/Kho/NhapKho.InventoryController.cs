using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Application.Features.Kho.Queries.DanhSachPhieuNhap;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
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

    [HttpPost("import-receipts/from-po")]
    [HttpPost("/api/kho/nhap-kho/from-po")]
    public Task<IActionResult> ImportFromPo(CreateImportFromPoRequest request) =>
        Send(new ClinicManagement.Application.Features.Kho.Commands.TaoPhieuNhapTuPO.TaoPhieuNhapTuPOCommand(request, CurrentUserId));

    [HttpPost("import-receipts/{id:int}/approve")]
    public Task<IActionResult> ApproveImport(int id) =>
        Send(new DuyetPhieuNhapCommand(id, CurrentUserId));

    [HttpPut("import-receipts/{id:int}")]
    public Task<IActionResult> UpdateImport(int id, ImportRequest request) =>
        Send(new CapNhatPhieuNhapCommand(id, request, CurrentUserId));

    [HttpPost("import-receipts/{id:int}/cancel")]
    public Task<IActionResult> CancelImport(int id, [FromBody] CancelImportRequest? request) =>
        Send(new HuyPhieuNhapCommand(id, request?.Reason, CurrentUserId));
}
