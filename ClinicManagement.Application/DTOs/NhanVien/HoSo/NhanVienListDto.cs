namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class NhanVienListDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string? TenChucVu { get; set; }
        public string ChuyenKhoa { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public decimal LuongCoBan { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}
