using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Extensions;
using ClinicManagement.API.Common;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected int CurrentUserId => User.GetUserId();

    protected string CurrentUserName => User.GetUserName();

    protected string CurrentUserFullName => User.GetUserFullName();

    protected string CurrentUserEmail => User.GetUserEmail();

    protected List<string> CurrentUserRoles => User.GetUserRoles();

    protected bool IsAuthenticated => User.IsAuthenticated();

    protected bool IsInRole(string role) => User.IsInRole(role);

    // ===== Response Helper =====

    protected IActionResult Success<T>(
        T? data,
        string message = "Thành công")
    {
        return Ok(ApiResponse<T>.Ok(data, message));
    }

    protected IActionResult Failure(
        string message,
        int statusCode = 400)
    {
        var response = ApiResponse<object>.Fail(message);

        return statusCode switch
        {
            400 => BadRequest(response),
            401 => Unauthorized(response),
            403 => StatusCode(403, response),
            404 => NotFound(response),
            _ => StatusCode(statusCode, response)
        };
    }
}