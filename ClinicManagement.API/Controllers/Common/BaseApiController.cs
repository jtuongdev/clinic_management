using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Extensions;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Controller cơ sở mở rộng cho phân hệ Người bệnh (Patient Portal API)
/// Cung cấp thuộc tính lấy thông tin định danh bệnh nhân (CurrentPatientId).
/// </summary>
[ApiController]
public abstract class BaseApiController : BaseController
{
    protected int CurrentPatientId => User.GetPatientId();
}
