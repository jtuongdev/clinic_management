using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Patient;
    public class BenhNhan : BaseEntity, IAggregateRoot
    {
        public string Ho { get; private set; } = string.Empty;
        public string Ten { get; private set; } = string.Empty;
        public DateTime NgaySinh { get; private set; }
        public GioiTinh GioiTinh { get; private set; }
        public string DienThoai { get; private set; } = string.Empty;
        public string? Email { get; private set; }
        public string? SoCCCD { get; private set; }
        public string? DiaChi { get; private set; }
        public string? NguoiLienHeTen { get; private set; }
        public string? NguoiLienHeDienThoai { get; private set; }
        public string? Username { get; private set; }
        public string? PasswordHash { get; private set; }

        public virtual ICollection<BenhNhanCoSo> BenhNhanCoSo { get; private set; }
        public virtual ICollection<BaoHiem> BaoHiems { get; private set; }
        public virtual ICollection<TienSuBenh> TienSuBenhs { get; private set; }
        public virtual ICollection<Examination.LuotKham> LuotKhams { get; private set; }
        public virtual ICollection<Billing.HoaDon> HoaDons { get; private set; }

        private BenhNhan() 
        {
            BenhNhanCoSo = new List<BenhNhanCoSo>();
            BaoHiems = new List<BaoHiem>();
            TienSuBenhs = new List<TienSuBenh>();
            LuotKhams = new List<Examination.LuotKham>();
            HoaDons = new List<Billing.HoaDon>();
        }

        public BenhNhan(
            string ho,
            string ten,
            DateTime ngaySinh,
            GioiTinh gioiTinh,
            string dienThoai,
            string? email,
            string? soCCCD,
            string? diaChi,
            int createdBy,
            string? nguoiLienHeTen = null,
            string? nguoiLienHeDienThoai = null,
            string? username = null,
            string? passwordHash = null)
        {
            Ho = ho;
            Ten = ten;
            NgaySinh = ngaySinh.Date;
            GioiTinh = gioiTinh;
            DienThoai = dienThoai;
            Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
            SoCCCD = string.IsNullOrWhiteSpace(soCCCD) ? null : soCCCD.Trim();
            DiaChi = string.IsNullOrWhiteSpace(diaChi) ? null : diaChi.Trim();
            CreatedBy = createdBy;

            NguoiLienHeTen = string.IsNullOrWhiteSpace(nguoiLienHeTen) ? null : nguoiLienHeTen.Trim();
            NguoiLienHeDienThoai = string.IsNullOrWhiteSpace(nguoiLienHeDienThoai) ? null : nguoiLienHeDienThoai.Trim();
            Username = string.IsNullOrWhiteSpace(username) ? null : username.Trim();
            PasswordHash = string.IsNullOrWhiteSpace(passwordHash) ? null : passwordHash;

            BenhNhanCoSo = new List<BenhNhanCoSo>();
            BaoHiems = new List<BaoHiem>();
            TienSuBenhs = new List<TienSuBenh>();
            LuotKhams = new List<Examination.LuotKham>();
            HoaDons = new List<Billing.HoaDon>();
        }
        public void UpdatePersonalInfo(
            string ho,
            string ten,
            DateTime ngaySinh,
            GioiTinh gioiTinh,
            string dienThoai,
            string? email,
            string? diaChi,
            string? nguoiLienHeTen,
            string? nguoiLienHeDienThoai)
        {
            Ho = ho;
            Ten = ten;
            NgaySinh = ngaySinh.Date;
            GioiTinh = gioiTinh;
            DienThoai = dienThoai;
            Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
            DiaChi = string.IsNullOrWhiteSpace(diaChi) ? null : diaChi.Trim();

            NguoiLienHeTen = string.IsNullOrWhiteSpace(nguoiLienHeTen) ? null : nguoiLienHeTen.Trim();
            NguoiLienHeDienThoai = string.IsNullOrWhiteSpace(nguoiLienHeDienThoai) ? null : nguoiLienHeDienThoai.Trim();
        }
        public void AddBaoHiem(LoaiBaoHiem loai, string tenNhaCungCap, string soThe, 
                              DateTime ngayBatDau, DateTime ngayKetThuc, decimal mucHuong)
        {
            BaoHiems ??= new List<BaoHiem>();

            var baoHiem = new BaoHiem
            {
                MaBenhNhan = Id,
                LoaiBaoHiem = loai,
                TenNhaCungCap = tenNhaCungCap,
                SoThe = soThe,
                NgayBatDau = ngayBatDau.Date,
                NgayKetThuc = ngayKetThuc.Date,
                MucHuong = mucHuong
            };
            BaoHiems.Add(baoHiem);
        }

        public void AddTienSu(
            LoaiTienSu loai,
            string ten,
            string ghiChu,
            int createdBy)
        {
            TienSuBenhs ??= new List<TienSuBenh>();

            var tienSu = new TienSuBenh
            {
                MaBenhNhan = Id,
                LoaiTienSu = loai,
                Ten = ten,
                GhiChu = ghiChu,
                CreatedBy = createdBy
            };

            TienSuBenhs.Add(tienSu);
        }

        public void AddLuotKham(Examination.LuotKham luotKham)
        {
            LuotKhams ??= new List<Examination.LuotKham>();
            LuotKhams.Add(luotKham);
        }

        public void ChangePassword(string newPasswordHash)
        {
            PasswordHash = newPasswordHash;
        }

        public void LinkUserAccount(string username, string passwordHash, string? email = null)
        {
            Username = username;
            PasswordHash = passwordHash;
            if (!string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(Email))
            {
                Email = email;
            }
        }
    }
