using MediatR;
using ClinicManagement.Application.DTOs.PatientAuth;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.Features.PatientAuth.Commands.DangKyBenhNhan
{
    public class DangKyBenhNhanCommand : IRequest<PatientAuthResponseDto>
    {
        public string Ho { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public GioiTinh GioiTinh { get; set; } = GioiTinh.O;
        public string? Email { get; set; }
        public string? SoCCCD { get; set; }
        public string? DiaChi { get; set; }
    }
}
