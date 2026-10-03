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
                MaKhoa = employee.NhanVienKhoa.Where(k => k.LaKhoaChinh).Select(k => (int?)k.MaKhoa).FirstOrDefault()
                         ?? employee.NhanVienKhoa.Select(k => (int?)k.MaKhoa).FirstOrDefault(),
                TenKhoa = employee.NhanVienKhoa.Where(k => k.LaKhoaChinh).Select(k => k.Khoa?.Ten).FirstOrDefault()
                          ?? employee.NhanVienKhoa.Select(k => k.Khoa?.Ten).FirstOrDefault(),
                ChuyenKhoa = employee.ChuyenKhoa,
                SoHanhNghe = employee.SoHanhNghe,
                IsActive = employee.IsActive,
                LuongCoBan = employee.LuongCoBan,
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
            var mainDept = employee.NhanVienKhoa?.FirstOrDefault(k => k.LaKhoaChinh)
                           ?? employee.NhanVienKhoa?.FirstOrDefault();
            return new NhanVienListDto
            {
                Id = employee.Id,
                Username = employee.Username,
                HoTen = employee.HoTen,
                Email = employee.Email,
                DienThoai = employee.DienThoai,
                MaChucVu = employee.MaChucVu,
                TenChucVu = employee.ChucVu?.TenChucVu,
                MaKhoa = mainDept?.MaKhoa,
                TenKhoa = mainDept?.Khoa?.Ten,
                ChuyenKhoa = employee.ChuyenKhoa,
                SoHanhNghe = employee.SoHanhNghe,
                NgaySinh = employee.NgaySinh,
                GioiTinh = employee.GioiTinh.ToString(),
                IsActive = employee.IsActive,
                LuongCoBan = employee.LuongCoBan,
                LastLogin = employee.LastLogin
            };
        }
    }
}
