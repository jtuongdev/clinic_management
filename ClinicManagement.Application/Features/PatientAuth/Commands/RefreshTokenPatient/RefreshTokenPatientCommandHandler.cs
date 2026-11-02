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

namespace ClinicManagement.Application.Features.PatientAuth.Commands.RefreshTokenPatient
{
    public class RefreshTokenPatientCommandHandler : IRequestHandler<RefreshTokenPatientCommand, PatientAuthResponseDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IJwtService _jwtService;
        private readonly ITokenLamMoiRepository _tokenLamMoiRepo;

        public RefreshTokenPatientCommandHandler(
            IBenhNhanRepository benhNhanRepo,
            IJwtService jwtService,
            ITokenLamMoiRepository tokenLamMoiRepo)
        {
            _benhNhanRepo = benhNhanRepo;
            _jwtService = jwtService;
            _tokenLamMoiRepo = tokenLamMoiRepo;
        }

        public async Task<PatientAuthResponseDto> Handle(RefreshTokenPatientCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                throw new UnauthorizedAccessException("Refresh token không được để trống.");
            }

            var token = await _tokenLamMoiRepo.GetByTokenAsync(request.RefreshToken, cancellationToken);
            if (token == null || token.DaHuyBo || token.DaHetHan() || !token.MaBenhNhan.HasValue)
            {
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
            }

            // Hủy token cũ (Token rotation)
            token.HuyBo();

            var patient = token.BenhNhan ?? await _benhNhanRepo.GetByIdAsync(token.MaBenhNhan.Value);
            if (patient == null)
            {
                throw new UnauthorizedAccessException("Không tìm thấy thông tin bệnh nhân tương ứng với phiên đăng nhập.");
            }

            // Sinh cặp token mới
            var newAccessToken = _jwtService.GeneratePatientAccessToken(patient);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            await _tokenLamMoiRepo.AddAsync(new TokenLamMoi
            {
                MaBenhNhan = patient.Id,
                MaToken = newRefreshToken,
                NgayHetHan = DateTime.UtcNow.AddDays(30),
                DaHuyBo = false
            }, cancellationToken);

            await _tokenLamMoiRepo.SaveChangesAsync(cancellationToken);

            return new PatientAuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                IsAccountLinked = false,
                Message = "Làm mới phiên đăng nhập thành công.",
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
