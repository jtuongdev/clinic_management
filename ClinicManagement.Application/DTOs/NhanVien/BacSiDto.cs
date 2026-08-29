using ClinicManagement.Application.DTOs.PhongKham;

namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class BacSiDto
    {
        public int Id { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string ChuyenKhoa { get; set; } = string.Empty;
        public string SoHanhNghe { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public List<PhongKhamDto>? PhongKhams { get; set; }
    }
}