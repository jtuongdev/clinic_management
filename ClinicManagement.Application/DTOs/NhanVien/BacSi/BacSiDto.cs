using ClinicManagement.Application.DTOs.PhongKham;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class BacSiDto
    {
        public int Id { get; set; }
        public string MaNhanVien { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string? ChuyenKhoa { get; set; }
        public string SoHanhNghe { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public bool DangTruc { get; set; }
        public int? MaPhongKhamMacDinh { get; set; }
        public string? TenPhongKhamMacDinh { get; set; }
        public List<PhongKhamDto> DanhSachPhongKham { get; set; } = new();
        public List<PhongKhamDto>? PhongKhams => DanhSachPhongKham;
    }
}