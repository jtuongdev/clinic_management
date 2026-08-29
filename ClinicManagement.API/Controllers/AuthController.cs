using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.Auth;
using ClinicManagement.Application.Features.Auth.Commands;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    public class AuthController : BaseController
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Tên đăng nhập và mật khẩu không được để trống" });
            }

            var command = new LoginCommand
            {
                Username = request.Username.Trim(),
                Password = request.Password
            };

            var result = await _mediator.Send(command);
            
            return Ok(new
            {
                success = true,
                data = result,
                message = "Đăng nhập thành công"
            });
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            return Ok(new
            {
                success = true,
                data = new
                {
                    UserId = CurrentUserId,
                    UserName = CurrentUserName,
                    FullName = CurrentUserFullName,
                    Email = CurrentUserEmail,
                    Roles = CurrentUserRoles,
                    IsAuthenticated = IsAuthenticated
                }
            });
        }

        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            return Ok(new
            {
                success = true,
                message = "Token hợp lệ"
            });
        }

        [HttpGet("has-role/{role}")]
        [Authorize]
        public IActionResult HasRole(string role)
        {
            return Ok(new
            {
                success = true,
                role = role,
                hasRole = IsInRole(role)
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok(new
            {
                success = true,
                message = "Đăng xuất thành công"
            });
        }
    }
}
