using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using PatientEntity = ClinicManagement.Domain.Patient.BenhNhan;

namespace ClinicManagement.Application.Features.PatientAuth.Commands.DoiMatKhauBenhNhan
{
    // 1. GỬI MÃ XÁC NHẬN OTP QUA EMAIL
    public class GuiMaOtpDoiMatKhauCommand : IRequest<string>
    {
        public int? PatientId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? TaiKhoan { get; set; }
    }

    public class GuiMaOtpDoiMatKhauCommandHandler : IRequestHandler<GuiMaOtpDoiMatKhauCommand, string>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IEmailSender _emailSender;

        public GuiMaOtpDoiMatKhauCommandHandler(
            IBenhNhanRepository benhNhanRepo,
            IEmailSender emailSender)
        {
            _benhNhanRepo = benhNhanRepo;
            _emailSender = emailSender;
        }

        public async Task<string> Handle(GuiMaOtpDoiMatKhauCommand request, CancellationToken cancellationToken)
        {
            var email = request.Email?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Vui lòng nhập địa chỉ email nhận mã xác nhận.");
            }

            PatientEntity? patient = null;

            // Nếu bệnh nhân đang đăng nhập (có PatientId từ JWT)
            if (request.PatientId.HasValue && request.PatientId.Value > 0)
            {
                patient = await _benhNhanRepo.GetByIdAsync(request.PatientId.Value);
            }

            // Nếu truyền thêm Tài khoản (SĐT / CCCD / Username)
            if (patient == null && !string.IsNullOrWhiteSpace(request.TaiKhoan))
            {
                var account = request.TaiKhoan.Trim();
                patient = await _benhNhanRepo.GetByUsernameAsync(account)
                          ?? await _benhNhanRepo.GetByPhoneAsync(account)
                          ?? await _benhNhanRepo.GetByCCCDAsync(account);
            }

            // Nếu tìm theo Email
            if (patient == null)
            {
                patient = await _benhNhanRepo.GetByEmailAsync(email);
            }

            if (patient == null || patient.IsDeleted)
            {
                throw new ArgumentException("Không tìm thấy tài khoản bệnh nhân tương ứng với thông tin đã nhập.");
            }

            // Sinh mã OTP 6 chữ số và lưu tạm thời (hiệu lực 5 phút)
            var otpCode = PatientPasswordOtpStore.GenerateAndSaveOtp(patient.Id, email);
            Console.WriteLine($"[PATIENT_OTP] Mã OTP cho email {email}: {otpCode}");
            var fullName = WebUtility.HtmlEncode($"{patient.Ho} {patient.Ten}".Trim());

            var subject = $"[AnCare Clinic] Mã xác nhận đổi mật khẩu: {otpCode}";
            var htmlBody = $@"
<div style=""font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;"">
    <h2 style=""color: #0284c7; margin-top: 0;"">Xác nhận đổi mật khẩu tài khoản bệnh nhân</h2>
    <p style=""color: #334155; font-size: 15px; line-height: 1.6;"">Xin chào <strong>{fullName}</strong>,</p>
    <p style=""color: #334155; font-size: 15px; line-height: 1.6;"">Hệ thống nhận được yêu cầu đổi mật khẩu cho tài khoản bệnh nhân của bạn. Vui lòng nhập mã xác nhận dưới đây vào ứng dụng để tiếp tục:</p>
    <div style=""margin: 24px 0; padding: 18px; background-color: #f0f9ff; border: 1px dashed #0284c7; border-radius: 10px; text-align: center;"">
        <span style=""font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: monospace;"">{otpCode}</span>
    </div>
    <p style=""color: #64748b; font-size: 13px;"">Mã xác nhận có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
</div>";

            await _emailSender.SendEmailAsync(email, subject, htmlBody, cancellationToken: cancellationToken);

            return $"Mã xác nhận gồm 6 chữ số đã được gửi tới email {email}.";
        }
    }

    // 2. XÁC MINH MÃ OTP TRƯỚC KHI CHO PHÉP ĐỔI MẬT KHẨU
    public class XacMinhOtpDoiMatKhauCommand : IRequest<bool>
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }

    public class XacMinhOtpDoiMatKhauCommandHandler : IRequestHandler<XacMinhOtpDoiMatKhauCommand, bool>
    {
        public Task<bool> Handle(XacMinhOtpDoiMatKhauCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.OtpCode))
            {
                throw new ArgumentException("Vui lòng nhập đầy đủ email và mã xác nhận.");
            }

            PatientPasswordOtpStore.VerifyOtp(request.Email, request.OtpCode, consume: false);
            return Task.FromResult(true);
        }
    }

    // 3. ĐỔI MẬT KHẨU SAU KHI XÁC NHẬN MÃ OTP
    public class DoiMatKhauBangOtpCommand : IRequest<bool>
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class DoiMatKhauBangOtpCommandHandler : IRequestHandler<DoiMatKhauBangOtpCommand, bool>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenLamMoiRepository _tokenLamMoiRepo;

        public DoiMatKhauBangOtpCommandHandler(
            IBenhNhanRepository benhNhanRepo,
            IPasswordHasher passwordHasher,
            ITokenLamMoiRepository tokenLamMoiRepo)
        {
            _benhNhanRepo = benhNhanRepo;
            _passwordHasher = passwordHasher;
            _tokenLamMoiRepo = tokenLamMoiRepo;
        }

        public async Task<bool> Handle(DoiMatKhauBangOtpCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                throw new ArgumentException("Mật khẩu mới phải từ 6 ký tự trở lên.");
            }

            var otpEntry = PatientPasswordOtpStore.VerifyOtp(request.Email, request.OtpCode, consume: true);

            var patient = await _benhNhanRepo.GetByIdAsync(otpEntry.PatientId);
            if (patient == null || patient.IsDeleted)
            {
                throw new ArgumentException("Không tìm thấy hồ sơ bệnh nhân.");
            }

            var hashedPassword = _passwordHasher.HashPassword(request.NewPassword);
            patient.ChangePassword(hashedPassword, request.Email.Trim());

            _benhNhanRepo.Update(patient);
            await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            // Thu hồi toàn bộ refresh token cũ của bệnh nhân
            await _tokenLamMoiRepo.RevokeAllByPatientAsync(patient.Id, cancellationToken);

            return true;
        }
    }
}
