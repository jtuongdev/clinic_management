using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.PatientAuth;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;
using PatientEntity = ClinicManagement.Domain.Patient.BenhNhan;

namespace ClinicManagement.Application.Features.PatientAuth.Commands.DangNhapBenhNhan
{
    public class DangNhapBenhNhanCommandHandler : IRequestHandler<DangNhapBenhNhanCommand, PatientAuthResponseDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;
        private readonly ITokenLamMoiRepository _tokenLamMoiRepo;

        public DangNhapBenhNhanCommandHandler(
            IBenhNhanRepository benhNhanRepo,
            IPasswordHasher passwordHasher,
            IJwtService jwtService,
            ITokenLamMoiRepository tokenLamMoiRepo)
        {
            _benhNhanRepo = benhNhanRepo;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
            _tokenLamMoiRepo = tokenLamMoiRepo;
        }

        public async Task<PatientAuthResponseDto> Handle(DangNhapBenhNhanCommand request, CancellationToken cancellationToken)
        {
            var account = request.TaiKhoan?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(account) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không được để trống.");
            }

            // 1. Tìm bệnh nhân theo Số điện thoại, Username, hoặc CCCD
            PatientEntity? patient = await _benhNhanRepo.GetByPhoneAsync(account);

            if (patient == null)
            {
                patient = await _benhNhanRepo.GetByUsernameAsync(account);
            }

            if (patient == null)
            {
                patient = await _benhNhanRepo.GetByCCCDAsync(account);
            }

            if (patient == null)
            {
                throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");
            }

            // 2. Kiểm tra tài khoản đã kích hoạt mật khẩu hay chưa
            if (string.IsNullOrWhiteSpace(patient.PasswordHash))
            {
                throw new UnauthorizedAccessException("Hồ sơ bệnh nhân chưa kích hoạt tài khoản ứng dụng. Vui lòng đăng ký tài khoản để kích hoạt.");
            }

            // 3. Xác thực mật khẩu
            bool isPasswordValid = _passwordHasher.VerifyPassword(request.Password, patient.PasswordHash);
            bool isLegacyPlainTextPassword = !isPasswordValid &&
                string.Equals(request.Password, patient.PasswordHash, StringComparison.Ordinal);

            if (!isPasswordValid)
            {
                if (!isLegacyPlainTextPassword)
                {
                    throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");
                }

                // Tự động nâng cấp mật khẩu cũ sang hash an toàn
                patient.ChangePassword(_passwordHasher.HashPassword(request.Password));
                _benhNhanRepo.Update(patient);
                await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);
            }

            // 4. Sinh JWT Access Token & Refresh Token
            var accessToken = _jwtService.GeneratePatientAccessToken(patient);
            var refreshToken = _jwtService.GenerateRefreshToken();

            await _tokenLamMoiRepo.AddAsync(new TokenLamMoi
            {
                MaBenhNhan = patient.Id,
                MaToken = refreshToken,
                NgayHetHan = DateTime.UtcNow.AddDays(30),
                DaHuyBo = false
            }, cancellationToken);

            await _tokenLamMoiRepo.SaveChangesAsync(cancellationToken);

            return new PatientAuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                IsAccountLinked = false,
                Message = "Đăng nhập thành công.",
                Patient = MapToPatientDto(patient)
            };
        }

        private static PatientInfoDto MapToPatientDto(PatientEntity patient)
        {
            return new PatientInfoDto
            {
                Id = patient.Id,
                Ho = patient.Ho,
                Ten = patient.Ten,
                FullName = $"{patient.Ho} {patient.Ten}".Trim(),
                DienThoai = patient.DienThoai,
                Email = patient.Email,
                SoCCCD = patient.SoCCCD,
                DiaChi = patient.DiaChi,
                NgaySinh = patient.NgaySinh,
                GioiTinh = patient.GioiTinh.ToString(),
                Username = patient.Username
            };
        }
    }
}
