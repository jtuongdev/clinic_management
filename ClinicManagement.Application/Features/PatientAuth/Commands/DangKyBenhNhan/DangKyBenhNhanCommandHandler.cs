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

namespace ClinicManagement.Application.Features.PatientAuth.Commands.DangKyBenhNhan
{
    public class DangKyBenhNhanCommandHandler : IRequestHandler<DangKyBenhNhanCommand, PatientAuthResponseDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;
        private readonly ITokenLamMoiRepository _tokenLamMoiRepo;

        public DangKyBenhNhanCommandHandler(
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

        public async Task<PatientAuthResponseDto> Handle(DangKyBenhNhanCommand request, CancellationToken cancellationToken)
        {
            var phone = request.DienThoai?.Trim() ?? string.Empty;
            var cccd = string.IsNullOrWhiteSpace(request.SoCCCD) ? null : request.SoCCCD.Trim();
            var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            var diaChi = string.IsNullOrWhiteSpace(request.DiaChi) ? null : request.DiaChi.Trim();

            if (string.IsNullOrWhiteSpace(phone))
            {
                throw new ArgumentException("Số điện thoại không được để trống.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("Mật khẩu không được để trống.");
            }

            // 1. Kiểm tra xem bệnh nhân đã tồn tại qua SĐT hoặc CCCD chưa
            PatientEntity? existingPatient = await _benhNhanRepo.GetByPhoneAsync(phone);

            if (existingPatient == null && !string.IsNullOrWhiteSpace(cccd))
            {
                existingPatient = await _benhNhanRepo.GetByCCCDAsync(cccd);
            }

            PatientEntity patientToAuth;
            bool isLinked = false;
            string message;

            if (existingPatient != null)
            {
                // Bệnh nhân đã tồn tại trong hệ thống phòng khám
                if (!string.IsNullOrWhiteSpace(existingPatient.PasswordHash))
                {
                    throw new InvalidOperationException("Số điện thoại hoặc CCCD này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng chức năng quên mật khẩu.");
                }

                // Trường hợp hồ sơ đã có ở phòng khám nhưng chưa liên kết tài khoản app:
                // Thực hiện liên kết tài khoản vào hồ sơ có sẵn
                var hashedPassword = _passwordHasher.HashPassword(request.Password);
                var username = !string.IsNullOrWhiteSpace(existingPatient.Username) 
                    ? existingPatient.Username 
                    : phone;

                existingPatient.LinkUserAccount(username, hashedPassword, email);
                _benhNhanRepo.Update(existingPatient);
                await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

                patientToAuth = existingPatient;
                isLinked = true;
                message = "Liên kết hồ sơ y tế thành công và kích hoạt tài khoản.";
            }
            else
            {
                // Bệnh nhân mới hoàn toàn -> Tạo mới
                var hashedPassword = _passwordHasher.HashPassword(request.Password);
                var newPatient = new PatientEntity(
                    ho: request.Ho?.Trim() ?? string.Empty,
                    ten: request.Ten?.Trim() ?? string.Empty,
                    ngaySinh: request.NgaySinh ?? new DateTime(2000, 1, 1),
                    gioiTinh: request.GioiTinh,
                    dienThoai: phone,
                    email: email,
                    soCCCD: cccd,
                    diaChi: diaChi,
                    createdBy: 0,
                    nguoiLienHeTen: null,
                    nguoiLienHeDienThoai: null,
                    username: phone,
                    passwordHash: hashedPassword
                );

                await _benhNhanRepo.AddAsync(newPatient);
                await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

                patientToAuth = newPatient;
                isLinked = false;
                message = "Đăng ký tài khoản thành công.";
            }

            // 2. Cấp Access Token & Refresh Token
            var accessToken = _jwtService.GeneratePatientAccessToken(patientToAuth);
            var refreshToken = _jwtService.GenerateRefreshToken();

            await _tokenLamMoiRepo.AddAsync(new TokenLamMoi
            {
                MaBenhNhan = patientToAuth.Id,
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
                IsAccountLinked = isLinked,
                Message = message,
                Patient = MapToPatientDto(patientToAuth)
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
