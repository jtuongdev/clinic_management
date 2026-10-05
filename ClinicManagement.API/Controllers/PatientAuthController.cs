using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.PatientAuth;
using ClinicManagement.Application.Features.PatientAuth.Commands.DangKyBenhNhan;
using ClinicManagement.Application.Features.PatientAuth.Commands.DangNhapBenhNhan;
using ClinicManagement.Application.Features.PatientAuth.Commands.RefreshTokenPatient;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/v1/patient-auth")]
    public class PatientAuthController : BaseApiController
    {
        private readonly IMediator _mediator;

        public PatientAuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Đăng ký tài khoản bệnh nhân (Tự động liên kết nếu hồ sơ SĐT/CCCD đã có tại phòng khám).
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] DangKyBenhNhanDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new DangKyBenhNhanCommand
            {
                Ho = request.Ho,
                Ten = request.Ten,
                DienThoai = request.DienThoai,
                Password = request.Password,
                NgaySinh = request.NgaySinh,
                GioiTinh = request.GioiTinh,
                Email = request.Email,
                SoCCCD = request.SoCCCD,
                DiaChi = request.DiaChi
            };

            try
            {
                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, result.Message);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 409);
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException?.InnerException?.Message ?? ex.InnerException?.Message ?? ex.Message;
                return Failure($"Đăng ký tài khoản thất bại: {innerMsg}", 500);
            }
        }

        /// <summary>
        /// Đăng nhập tài khoản bệnh nhân (bằng SĐT, Username, hoặc CCCD).
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] DangNhapBenhNhanDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new DangNhapBenhNhanCommand
            {
                TaiKhoan = request.TaiKhoan,
                Password = request.Password
            };

            try
            {
                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, result.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Failure(ex.Message, 401);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return Failure($"Đăng nhập thất bại: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// Cấp lại Access Token mới cho bệnh nhân từ Refresh Token.
        /// </summary>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenPatientDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new RefreshTokenPatientCommand(request.RefreshToken);

            try
            {
                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, result.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Failure(ex.Message, 401);
            }
            catch (Exception ex)
            {
                return Failure($"Làm mới phiên đăng nhập thất bại: {ex.Message}", 500);
            }
        }
    }
}
