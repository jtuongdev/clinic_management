using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    [HttpGet("exports/procedure-supplies")]
    public Task<IActionResult> GetProcedureSuppliesExports(
        [FromQuery] int? khoId = null,
        [FromQuery] string? loaiXuat = null,
        [FromQuery] string? keyword = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10) =>
        Send(new ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatVatTu.LayDanhSachPhieuXuatVatTuQuery(
            khoId, loaiXuat, keyword, fromDate, toDate, pageIndex, pageSize, CurrentUserId));

    [HttpPost("exports/internal-use")]
    public Task<IActionResult> InternalUse(ExportRequest request) =>
        Send(new XuatNoiBoCommand(request, CurrentUserId));

    [HttpPost("returns")]
    public Task<IActionResult> ReturnToSupplier(StockMutationRequest request) =>
        Send(new TraNhaCungCapCommand(request, CurrentUserId));

    [HttpPost("write-offs")]
    public Task<IActionResult> WriteOff(StockMutationRequest request) =>
        Send(new HuyTonCommand(request, CurrentUserId));
}
