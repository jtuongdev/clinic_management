using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class ThongTinBenhNhanTrongLuotKhamDto
    {
        public int LuotKhamId { get; set; }
        public string MaLuotKham { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public string Phong { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;

        public string HoTen { get; set; } = string.Empty;
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public string NgaySinh { get; set; } = string.Empty;
        public string GioiTinh { get; set; } = string.Empty;
        public string SoCCCD { get; set; } = string.Empty;
        public string Bhyt { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
    }
}
