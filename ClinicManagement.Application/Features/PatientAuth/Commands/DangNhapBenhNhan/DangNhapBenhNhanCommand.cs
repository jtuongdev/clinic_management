using MediatR;
using ClinicManagement.Application.DTOs.PatientAuth;

namespace ClinicManagement.Application.Features.PatientAuth.Commands.DangNhapBenhNhan
{
    public class DangNhapBenhNhanCommand : IRequest<PatientAuthResponseDto>
    {
        public string TaiKhoan { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
