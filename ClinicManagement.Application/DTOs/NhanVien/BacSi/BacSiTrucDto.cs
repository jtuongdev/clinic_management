namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class BacSiTrucDto
    {
        public int Id { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public string Phong { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty; // "Dang Kham", "Qua Tai", "Ranh"
        public int SoLuongCho { get; set; }
    }
}