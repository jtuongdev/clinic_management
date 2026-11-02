using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Hoàn trả thuốc từ bệnh nhân (Patient Medicine Return).
/// Tiếp nhận thuốc bệnh nhân trả lại, cập nhật hoàn kho và điều chỉnh giá trị thanh toán.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Tiếp nhận hoàn trả thuốc từ bệnh nhân và nhập lại kho dược theo lô tương ứng.
    /// </summary>
    [HttpPost("returns/patient")]
    public Task<IActionResult> ReturnFromPatient(PatientReturnRequest request) =>
        Send(new HoanThuocBenhNhanCommand(request, CurrentUserId));
}
