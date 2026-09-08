// Application/DTOs/BenhNhan/CongNoDto.cs
using System;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class CongNoDto
    {
        public int Id { get; set; }
        public int MaBenhNhan { get; set; }
        public int MaHoaDon { get; set; }
        public decimal SoTienNo { get; set; }
        public decimal SoTienDaTra { get; set; }
        public decimal SoTienConLai { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime? HanThanhToan { get; set; }
    }
}