using System;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.Features.PatientPortal.Commands.CapNhatHoSoMe
{
    public class CapNhatHoSoMeCommand : IRequest<BenhNhanProfileDto>
    {
        public int PatientId { get; set; }
        public string? Ho { get; set; }
        public string? Ten { get; set; }
        public DateTime? NgaySinh { get; set; }
        public GioiTinh? GioiTinh { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public string? NguoiLienHeTen { get; set; }
        public string? NguoiLienHeDienThoai { get; set; }
    }
}
