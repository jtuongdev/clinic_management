using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class NhanVienDetailDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string MaNhanVien => string.IsNullOrWhiteSpace(Username) ? $"NV{Id:D4}" : Username;
        public string HoTen { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public GioiTinh GioiTinh { get; set; }
        public string Email { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public int? MaChucVu { get; set; }
        public string? TenChucVu { get; set; }
        public int? MaKhoa { get; set; }
        public string? TenKhoa { get; set; }
        public string ChuyenKhoa { get; set; } = string.Empty;
        public string SoHanhNghe { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public decimal LuongCoBan { get; set; }
        public DateTime? LastLogin { get; set; }
        public List<NhanVienRoleDto> VaiTros { get; set; } = [];
        public List<NhanVienDepartmentDto> Khoas { get; set; } = [];
    }

    public class NhanVienRoleDto
    {
        public int Id { get; set; }
        public int MaVaiTro { get; set; }
        public string TenVaiTro { get; set; } = string.Empty;
        public DateTime NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
    }

    public class NhanVienDepartmentDto
    {
        public int Id { get; set; }
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public DateTime TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public bool LaKhoaChinh { get; set; }
    }
}
