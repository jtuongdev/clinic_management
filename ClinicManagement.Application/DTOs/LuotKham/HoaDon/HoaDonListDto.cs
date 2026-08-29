// HoaDonListDto.cs
using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class HoaDonListDto
    {
        public int Id { get; set; }
        public string SoHoaDon { get; set; } = string.Empty;
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public string TenBenhNhan { get; set; } = string.Empty;
        public decimal TongTien { get; set; }
        public decimal DaThanhToan { get; set; }
        public decimal SoTienConLai => TongTien - DaThanhToan;
        public string TrangThai { get; set; } = string.Empty; // CHUA_THANH_TOAN, THANH_TOAN_MOT_PHAN, DA_THANH_TOAN, DA_HUY
        public DateTime NgayLap { get; set; }
        public int MaLuotKham { get; set; }
        public int MaBenhNhan { get; set; }
        public int MaCoSo { get; set; }
        public decimal SoTienBaoHiemChiTra { get; set; }
        public string? GhiChu { get; set; }
    }
}