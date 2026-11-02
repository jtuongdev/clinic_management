using System;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class HoaDonSummaryDto
    {
        public int Id { get; set; }
        public string SoHoaDon { get; set; } = string.Empty;
        public DateTime NgayLap { get; set; }
        public decimal TongTien { get; set; }
        public decimal DaThanhToan { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public decimal ConNo => TongTien - DaThanhToan;
    }
}