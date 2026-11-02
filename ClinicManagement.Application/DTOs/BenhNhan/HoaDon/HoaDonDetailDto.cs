using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class HoaDonDetailDto
    {
        public int Id { get; set; }
        public string SoHoaDon { get; set; } = string.Empty;
        public int MaLuotKham { get; set; }
        public int MaBenhNhan { get; set; }
        public string TenBenhNhan { get; set; } = string.Empty;
        public DateTime NgayLap { get; set; }
        public decimal TongTien { get; set; }
        public decimal SoTienBaoHiemChiTra { get; set; }
        public decimal SoTienBenhNhanChiTra { get; set; }
        public decimal DaThanhToan { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
        public string? SoTheBHYT { get; set; }
        public string? TenNhaCungCapBHYT { get; set; }
        public decimal? MucHuongBHYT { get; set; }
        public DateTime? NgayBatDauBHYT { get; set; }
        public DateTime? NgayKetThucBHYT { get; set; }
        public bool? BHYTConHan { get; set; }

        public List<ChiTietHoaDonDto> ChiTiet { get; set; } = new();
        public List<PhieuThuDto> PhieuThus { get; set; } = new();
        public CongNoDto? CongNo { get; set; }
    }
}