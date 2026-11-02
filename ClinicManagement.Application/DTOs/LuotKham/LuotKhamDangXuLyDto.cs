using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class LuotKhamDangXuLyDto
    {
        public int Id { get; set; }
        public string MaLuotKham { get; set; } = string.Empty;
        public string TenBenhNhan { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public string BacSi { get; set; } = string.Empty;
        public string Phong { get; set; } = string.Empty;
        public DateTime? ThoiGianBatDauKham { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public int SoThuTu { get; set; }
    }
}