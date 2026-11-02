namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class NhanVienListDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string MaNhanVien => string.IsNullOrWhiteSpace(Username) ? $"NV{Id:D4}" : Username;
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public int? MaChucVu { get; set; }
        public string? TenChucVu { get; set; }
        public int? MaKhoa { get; set; }
        public string? TenKhoa { get; set; }
        public string ChuyenKhoa { get; set; } = string.Empty;
        public string SoHanhNghe { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public bool IsActive { get; set; }
        public decimal LuongCoBan { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}
