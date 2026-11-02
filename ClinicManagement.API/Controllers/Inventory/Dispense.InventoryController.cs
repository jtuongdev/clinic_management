using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Application.Features.Kho.Queries.LayDuLieuInDonThuoc;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Cấp phát thuốc theo đơn khám bệnh (Prescription Dispense).
/// Quản lý danh sách đơn chờ phát, đơn đã phát, xem trước phân bổ lô hạn dùng FEFO, thực hiện cấp phát và xuất dữ liệu in đơn.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Lấy danh sách đơn thuốc đang chờ dược sĩ cấp phát tại quầy dược.
    /// </summary>
    [HttpGet("prescriptions/pending")]
    public Task<IActionResult> PendingPrescriptions(int pageIndex = 1, int pageSize = 20) =>
        Send(new LayDonChoCapPhatQuery(pageIndex, pageSize, CurrentUserId));

    /// <summary>
    /// Lấy danh sách đơn thuốc đã hoàn thành cấp phát có lọc theo thời gian và từ khóa.
    /// </summary>
    [HttpGet("prescriptions/dispensed")]
    public Task<IActionResult> DispensedPrescriptions(
        [FromQuery] string? keyword,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20) =>
        Send(new LayDonDaCapPhatQuery(keyword, fromDate, toDate, pageIndex, pageSize, CurrentUserId));

    /// <summary>
    /// Thực hiện cấp phát thuốc cho đơn thuốc theo nguyên tắc FEFO (First Expired, First Out).
    /// </summary>
    [HttpPost("prescriptions/{prescriptionId:int}/dispense")]
    public Task<IActionResult> Dispense(int prescriptionId, DispenseRequest request) =>
        Send(new CapPhatDonCommand(prescriptionId, request, CurrentUserId));

    /// <summary>
    /// Xem trước việc phân bổ các lô thuốc theo quy tắc FEFO trước khi bấm cấp phát.
    /// </summary>
    [HttpGet("prescriptions/{prescriptionId:int}/preview-fefo")]
    public Task<IActionResult> PreviewFefo(int prescriptionId) =>
        Send(new XemTruocPhanBoFefoQuery(prescriptionId, CurrentUserId));

    /// <summary>
    /// Lấy dữ liệu chi tiết của đơn thuốc đã cấp phát để in phiếu xuất thuốc / hướng dẫn sử dụng.
    /// </summary>
    [HttpGet("prescriptions/{prescriptionId:int}/print-data")]
    public Task<IActionResult> PrescriptionPrintData(int prescriptionId) =>
        Send(new LayDuLieuInDonThuocQuery(prescriptionId, CurrentUserId));
}

