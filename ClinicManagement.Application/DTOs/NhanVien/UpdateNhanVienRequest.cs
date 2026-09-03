using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class UpdateNhanVienRequest
    {
        public string HoTen { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public GioiTinh GioiTinh { get; set; }
        public string Email { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public int? MaChucVu { get; set; }
        public string ChuyenKhoa { get; set; } = string.Empty;
        public string SoHanhNghe { get; set; } = string.Empty;
    }
}
