using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Extensions;

namespace ClinicManagement.API.Controllers;

[ApiController]
public abstract class BaseApiController : BaseController
{
    protected int CurrentPatientId => User.GetPatientId();
}
