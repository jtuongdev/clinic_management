namespace ClinicManagement.Application.DTOs.Khoa
{
    public class KhoaOverviewDto
    {
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public int TongLuotKham { get; set; }
        public int SoLuotCho { get; set; }
        public int SoBacSi { get; set; }
        public string TrangThai { get; set; } = string.Empty; // "HoatDong", "QuaTai", "BinhThuong"
    }
}