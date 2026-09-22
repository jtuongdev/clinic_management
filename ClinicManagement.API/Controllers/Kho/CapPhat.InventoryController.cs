using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Application.Features.Kho.Queries.LayDuLieuInDonThuoc;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    [HttpGet("prescriptions/pending")]
    public Task<IActionResult> PendingPrescriptions(int pageIndex = 1, int pageSize = 20) =>
        Send(new LayDonChoCapPhatQuery(pageIndex, pageSize, CurrentUserId));

    [HttpGet("prescriptions/dispensed")]
    public Task<IActionResult> DispensedPrescriptions(
        [FromQuery] string? keyword,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20) =>
        Send(new LayDonDaCapPhatQuery(keyword, fromDate, toDate, pageIndex, pageSize, CurrentUserId));

    [HttpPost("prescriptions/{prescriptionId:int}/dispense")]
    public Task<IActionResult> Dispense(int prescriptionId, DispenseRequest request) =>
        Send(new CapPhatDonCommand(prescriptionId, request, CurrentUserId));

    [HttpGet("prescriptions/{prescriptionId:int}/preview-fefo")]
    public Task<IActionResult> PreviewFefo(int prescriptionId) =>
        Send(new XemTruocPhanBoFefoQuery(prescriptionId, CurrentUserId));

    [HttpGet("prescriptions/{prescriptionId:int}/print-data")]
    public Task<IActionResult> PrescriptionPrintData(int prescriptionId) =>
        Send(new LayDuLieuInDonThuocQuery(prescriptionId, CurrentUserId));
}

