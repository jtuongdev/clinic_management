using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.PatientAuth;
using ClinicManagement.Application.Features.PatientAuth.Commands.DangKyBenhNhan;
using ClinicManagement.Application.Features.PatientAuth.Commands.DangNhapBenhNhan;
using ClinicManagement.Application.Features.PatientAuth.Commands.DoiMatKhauBenhNhan;
using ClinicManagement.Application.Features.PatientAuth.Commands.RefreshTokenPatient;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Cổng Bệnh nhân (Patient Portal) - Đăng ký, Đăng nhập & Xác thực JWT cho ứng dụng người bệnh
    /// Route: api/v1/patient-auth
    /// </summary>
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

        /// <summary>
        /// Bước 1: Gửi mã xác nhận OTP (6 chữ số) qua Email để đổi mật khẩu bệnh nhân.
        /// Hỗ trợ cả khi bệnh nhân đang đăng nhập (tự nhận diện qua JWT) hoặc quên mật khẩu ngoài màn hình đăng nhập.
        /// </summary>
        [HttpPost("send-password-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> SendPasswordOtp(
            [FromBody] GuiMaXacNhanDoiMatKhauDto request,
            [FromServices] IBenhNhanRepository benhNhanRepo,
            [FromServices] IEmailSender emailSender,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            int currentPatientId = CurrentPatientId;
            var command = new GuiMaOtpDoiMatKhauCommand
            {
                PatientId = currentPatientId > 0 ? currentPatientId : null,
                Email = request.Email,
                TaiKhoan = request.TaiKhoan
            };

            try
            {
                var handler = new GuiMaOtpDoiMatKhauCommandHandler(benhNhanRepo, emailSender);
                var message = await handler.Handle(command, cancellationToken);
                return Success(true, message);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return Failure($"Không thể gửi mã xác nhận: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// Bước 2: Xác minh mã OTP đã gửi qua Email trước khi cho phép nhập mật khẩu mới.
        /// </summary>
        [HttpPost("verify-password-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyPasswordOtp([FromBody] XacMinhMaOtpDoiMatKhauDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new XacMinhOtpDoiMatKhauCommand
            {
                Email = request.Email,
                OtpCode = request.OtpCode
            };

            try
            {
                var handler = new XacMinhOtpDoiMatKhauCommandHandler();
                var result = await handler.Handle(command, cancellationToken);
                return Success(result, "Xác thực mã OTP thành công. Bạn có thể đặt mật khẩu mới.");
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return Failure($"Xác thực mã OTP thất bại: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// Bước 3: Đổi mật khẩu bệnh nhân sau khi đã xác thực mã OTP qua Email.
        /// </summary>
        [HttpPost("change-password-with-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> ChangePasswordWithOtp(
            [FromBody] DoiMatKhauBangOtpDto request,
            [FromServices] IBenhNhanRepository benhNhanRepo,
            [FromServices] IPasswordHasher passwordHasher,
            [FromServices] ITokenLamMoiRepository tokenLamMoiRepo,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new DoiMatKhauBangOtpCommand
            {
                Email = request.Email,
                OtpCode = request.OtpCode,
                NewPassword = request.NewPassword
            };

            try
            {
                var handler = new DoiMatKhauBangOtpCommandHandler(benhNhanRepo, passwordHasher, tokenLamMoiRepo);
                var result = await handler.Handle(command, cancellationToken);
                return Success(result, "Đổi mật khẩu thành công.");
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return Failure($"Đổi mật khẩu thất bại: {ex.Message}", 500);
            }
        }
    }
}
