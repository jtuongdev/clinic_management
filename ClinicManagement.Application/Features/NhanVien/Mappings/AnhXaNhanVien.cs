using ClinicManagement.Application.DTOs.NhanVien;
using NhanVienEntity = ClinicManagement.Domain.Identity.NhanVien;

namespace ClinicManagement.Application.Features.NhanVien
{
    internal static class AnhXaNhanVien
    {
        public static NhanVienDetailDto ToDetail(NhanVienEntity employee)
        {
            return new NhanVienDetailDto
            {
                Id = employee.Id,
                Username = employee.Username,
                HoTen = employee.HoTen,
                NgaySinh = employee.NgaySinh,
                GioiTinh = employee.GioiTinh,
                Email = employee.Email,
                DienThoai = employee.DienThoai,
                MaChucVu = employee.MaChucVu,
                TenChucVu = employee.ChucVu?.TenChucVu,
                ChuyenKhoa = employee.ChuyenKhoa,
                SoHanhNghe = employee.SoHanhNghe,
                IsActive = employee.IsActive,
                LastLogin = employee.LastLogin,
                VaiTros = employee.NhanVienVaiTro.Select(x => new NhanVienRoleDto
                {
                    Id = x.Id,
                    MaVaiTro = x.MaVaiTro,
                    TenVaiTro = x.VaiTro?.TenVaiTro ?? string.Empty,
                    NgayBatDau = x.NgayBatDau,
                    NgayKetThuc = x.NgayKetThuc
                }).ToList(),
                Khoas = employee.NhanVienKhoa.Select(x => new NhanVienDepartmentDto
                {
                    Id = x.Id,
                    MaKhoa = x.MaKhoa,
                    TenKhoa = x.Khoa?.Ten ?? string.Empty,
                    TuNgay = x.TuNgay,
                    DenNgay = x.DenNgay,
                    LaKhoaChinh = x.LaKhoaChinh
                }).ToList()
            };
        }

        public static NhanVienListDto ToListItem(NhanVienEntity employee)
        {
            return new NhanVienListDto
            {
                Id = employee.Id,
                Username = employee.Username,
                HoTen = employee.HoTen,
                Email = employee.Email,
                DienThoai = employee.DienThoai,
                TenChucVu = employee.ChucVu?.TenChucVu,
                ChuyenKhoa = employee.ChuyenKhoa,
                IsActive = employee.IsActive,
                LuongCoBan = employee.LuongCoBan,
                LastLogin = employee.LastLogin
            };
        }
    }
}
