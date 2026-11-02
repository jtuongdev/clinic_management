using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class LuotKhamListDto
    {
        public int Id { get; set; }
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public string TenBenhNhan { get; set; } = string.Empty;
        public int Tuoi { get; set; }
        public string GioiTinh { get; set; } = string.Empty;
        public string TenPhongKham { get; set; } = string.Empty;
        public string HinhThucDieuTri { get; set; } = string.Empty;
        public bool CoBHYT { get; set; }
        public string TenBacSi { get; set; } = string.Empty;
        public string TenKhoa { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime? ThoiGianBatDauKham { get; set; }
        public int? SoThuTu { get; set; }
    }
}