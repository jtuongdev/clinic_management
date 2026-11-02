using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class HangDoiDto
    {
        public int Id { get; set; }                     // Id của lượt khám
        public int? SoThuTu { get; set; }               // STT
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string GioiTinh { get; set; } = string.Empty;
        public int Tuoi { get; set; }
        public string MaLuotKham { get; set; } = string.Empty;
        public string TenKhoa { get; set; } = string.Empty;
        public DateTime? ThoiGianCapNhat { get; set; }  // = thời gian bắt đầu khám hoặc ngày tạo
        public string TrangThai { get; set; } = string.Empty;
    }
}