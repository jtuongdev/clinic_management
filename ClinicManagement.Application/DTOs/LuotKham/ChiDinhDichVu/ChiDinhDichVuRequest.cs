using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class ChiDinhDichVuRequest
    {
        public int MaDanhMuc { get; set; }
        public int MaBacSiChiDinh { get; set; }
        public int? MaNguoiThucHien { get; set; }
        public string? TrangThai { get; set; }
        public string? KetLuan { get; set; }
        public string? UrlKetQua { get; set; }
        public DateTime? NgayChiDinh { get; set; }
        public DateTime? NgayThucHien { get; set; }
        public DateTime? NgayCoKetQua { get; set; }
    }
}
