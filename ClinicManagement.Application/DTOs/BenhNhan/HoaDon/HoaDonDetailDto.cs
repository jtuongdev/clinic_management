using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class HoaDonDetailDto
    {
        public int Id { get; set; }
        public string SoHoaDon { get; set; } = string.Empty;
        public DateTime NgayLap { get; set; }
        public decimal TongTien { get; set; }
        public decimal SoTienBaoHiemChiTra { get; set; }
        public decimal SoTienBenhNhanChiTra { get; set; }
        public decimal DaThanhToan { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;

        public List<ChiTietHoaDonDto> ChiTiet { get; set; } = new();
        public List<PhieuThuDto> PhieuThus { get; set; } = new();
        public CongNoDto? CongNo { get; set; }
    }
}