using System;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.PatientPortal
{
    public class CapNhatHoSoMeDto
    {
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
