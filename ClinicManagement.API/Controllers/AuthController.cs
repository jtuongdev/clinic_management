using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Common;
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
        public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Tên đăng nhập và mật khẩu không được để trống" });
            }

            var command = new DangNhapCommand
            {
                Username = request.Username.Trim(),
                Password = request.Password
            };

            try
            {
                var result = await _mediator.Send(command, cancellationToken);
            
                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Đăng nhập thành công"
                });
            }
            catch (UnauthorizedAccessException exception)
            {
                return Unauthorized(ApiResponse<object>.Fail(exception.Message));
            }
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request?.RefreshToken))
            {
                return BadRequest(ApiResponse<object>.Fail("Refresh token không được để trống"));
            }

            try
            {
                var result = await _mediator.Send(new LamMoiTokenCommand(request.RefreshToken), cancellationToken);
                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Làm mới token thành công"
                });
            }
            catch (UnauthorizedAccessException exception)
            {
                return Unauthorized(ApiResponse<object>.Fail(exception.Message));
            }
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
        public async Task<IActionResult> Logout([FromBody] LogoutRequest? request, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DangXuatCommand(CurrentUserId, request?.RefreshToken), cancellationToken);
            return Ok(new
            {
                success = true,
                message = "Đăng xuất thành công"
            });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.OldPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(ApiResponse<object>.Fail("Mật khẩu không được để trống."));
            }

            int userId = CurrentUserId;
            if (userId <= 0)
            {
                return Unauthorized(ApiResponse<object>.Fail("Không thể xác định thông tin người dùng."));
            }

            var command = new DoiMatKhauCommand
            {
                UserId = userId,
                OldPassword = request.OldPassword,
                NewPassword = request.NewPassword
            };

            var result = await _mediator.Send(command, cancellationToken);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Message));
            }

            return Ok(ApiResponse<bool>.Ok(true, result.Message));
        }
    }
}
