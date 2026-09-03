using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility; 

namespace ClinicManagement.Domain.Identity
{
    public class NhanVien : BaseEntity, IAggregateRoot
    {
        public string Username { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public string HoTen { get; private set; } = string.Empty;
        public DateTime? NgaySinh { get; private set; }
        public GioiTinh GioiTinh { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public string DienThoai { get; private set; } = string.Empty;
        public int? MaChucVu { get; private set; }
        public string ChuyenKhoa { get; private set; } = string.Empty;
        public string SoHanhNghe { get; private set; } = string.Empty;
        public bool IsActive { get; private set; }
        public DateTime? LastLogin { get; private set; }

        public virtual ChucVu? ChucVu { get; private set; }
        public virtual ICollection<NhanVienVaiTro> NhanVienVaiTro { get; private set; }
        public virtual ICollection<PhanQuyenCoSo> PhanQuyenCoSo { get; private set; }
        public virtual ICollection<NhanVienKhoa> NhanVienKhoa { get; private set; }

        private NhanVien() 
        {
            NhanVienVaiTro = new List<NhanVienVaiTro>();
            PhanQuyenCoSo = new List<PhanQuyenCoSo>();
            NhanVienKhoa = new List<NhanVienKhoa>();
        }

        public NhanVien(string username, string passwordHash, string hoTen, DateTime? ngaySinh,
                       GioiTinh gioiTinh, string email, string dienThoai, int? maChucVu,
                       string chuyenKhoa = "", string soHanhNghe = "")
        {
            if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username không được để trống.", nameof(username));
            if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("Password hash không được để trống.", nameof(passwordHash));
            if (string.IsNullOrWhiteSpace(hoTen)) throw new ArgumentException("Họ tên không được để trống.", nameof(hoTen));

            Username = username;
            PasswordHash = passwordHash;
            HoTen = hoTen;
            NgaySinh = ngaySinh?.Date; 
            GioiTinh = gioiTinh;
            Email = email;
            DienThoai = dienThoai;
            MaChucVu = maChucVu;
            ChuyenKhoa = chuyenKhoa ?? string.Empty;
            SoHanhNghe = soHanhNghe ?? string.Empty;
            IsActive = true;
            
            NhanVienVaiTro = new List<NhanVienVaiTro>();
            PhanQuyenCoSo = new List<PhanQuyenCoSo>();
            NhanVienKhoa = new List<NhanVienKhoa>();
        }

        public void UpdateProfile(string hoTen, DateTime? ngaySinh, GioiTinh gioiTinh, string email, string dienThoai)
        {
            if (string.IsNullOrWhiteSpace(hoTen)) throw new ArgumentException("Họ tên không được để trống.", nameof(hoTen));

            HoTen = hoTen;
            NgaySinh = ngaySinh?.Date; 
            GioiTinh = gioiTinh;
            Email = email;
            DienThoai = dienThoai;
        }

        public void UpdateEmployment(int? maChucVu, string chuyenKhoa, string soHanhNghe)
        {
            MaChucVu = maChucVu;
            ChuyenKhoa = chuyenKhoa ?? string.Empty;
            SoHanhNghe = soHanhNghe ?? string.Empty;
        }

        public void SetPassword(string hashedPassword)
        {
            PasswordHash = hashedPassword;
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;
        public void RecordLogin() => LastLogin = DateTime.UtcNow;

        public void AssignRole(VaiTro vaiTro, DateTime ngayBatDau, DateTime? ngayKetThuc = null)
        {
            if (vaiTro == null) throw new ArgumentNullException(nameof(vaiTro));
            if (ngayKetThuc.HasValue && ngayKetThuc.Value.Date < ngayBatDau.Date)
                throw new ArgumentException("Ngày kết thúc vai trò phải lớn hơn hoặc bằng ngày bắt đầu.", nameof(ngayKetThuc));
            
            NhanVienVaiTro ??= new List<NhanVienVaiTro>();

            var nhanVienVaiTro = new NhanVienVaiTro
            {
                MaNhanVien = Id,
                MaVaiTro = vaiTro.Id,
                NgayBatDau = ngayBatDau,
                NgayKetThuc = ngayKetThuc
            };
            NhanVienVaiTro.Add(nhanVienVaiTro);
        }

        public void ReplaceRoles(IEnumerable<VaiTro> vaiTros, DateTime ngayBatDau, DateTime? ngayKetThuc = null)
        {
            NhanVienVaiTro.Clear();
            foreach (var vaiTro in vaiTros.DistinctBy(role => role.Id))
            {
                AssignRole(vaiTro, ngayBatDau, ngayKetThuc);
            }
        }

        public void AssignToKhoa(Khoa khoa, DateTime tuNgay, DateTime? denNgay = null, bool laKhoaChinh = false)
        {
            if (khoa == null) throw new ArgumentNullException(nameof(khoa));
            if (denNgay.HasValue && denNgay.Value.Date < tuNgay.Date)
                throw new ArgumentException("Ngày kết thúc khoa phải lớn hơn hoặc bằng ngày bắt đầu.", nameof(denNgay));
            if (laKhoaChinh && NhanVienKhoa.Any(x => x.LaKhoaChinh &&
                x.TuNgay <= (denNgay ?? DateTime.MaxValue) &&
                (x.DenNgay == null || x.DenNgay >= tuNgay)))
                throw new InvalidOperationException("Nhân viên đã có khoa chính trong khoảng thời gian này.");

            NhanVienKhoa ??= new List<NhanVienKhoa>();

            var nhanVienKhoa = new NhanVienKhoa
            {
                MaNhanVien = Id,
                MaKhoa = khoa.Id,
                TuNgay = tuNgay,
                DenNgay = denNgay,
                LaKhoaChinh = laKhoaChinh
            };
            NhanVienKhoa.Add(nhanVienKhoa);
        }
    }
}
