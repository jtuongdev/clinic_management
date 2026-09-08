using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

public sealed partial class InventoryController
{
    [HttpPost("returns/patient")]
    public Task<IActionResult> ReturnFromPatient(PatientReturnRequest request) =>
        Send(new HoanThuocBenhNhanCommand(request, CurrentUserId));
}
