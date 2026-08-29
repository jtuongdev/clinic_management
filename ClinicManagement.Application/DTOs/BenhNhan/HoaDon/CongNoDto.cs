// Application/DTOs/BenhNhan/CongNoDto.cs
using System;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class CongNoDto
    {
        public decimal SoTienNo { get; set; }
        public decimal SoTienDaTra { get; set; }
        public decimal SoTienConLai { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime? HanThanhToan { get; set; }
    }
}