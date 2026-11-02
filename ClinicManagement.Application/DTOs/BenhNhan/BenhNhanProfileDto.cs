// Application/DTOs/BenhNhan/BenhNhanProfileDto.cs
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class BenhNhanProfileDto
    {
        // ===== Thông tin cá nhân =====
        public int Id { get; set; }
        public string Ho { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string HoTen => $"{Ho} {Ten}";
        public DateTime NgaySinh { get; set; }
        public string GioiTinh { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SoCCCD { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string NguoiLienHeTen { get; set; } = string.Empty;
        public string NguoiLienHeDienThoai { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }

        // ===== Thông tin cơ sở =====
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public string TenCoSo { get; set; } = string.Empty;
        public DateTime NgayDangKy { get; set; }

        // ===== Tài khoản =====
        public TaiKhoanDto? TaiKhoan { get; set; }

        // ===== Người tạo =====
        public NguoiTaoDto? NguoiTao { get; set; }

        // ===== Thông tin tổng quan =====
        public ThongTinTongQuanDto? ThongTinTongQuan { get; set; }

        // ===== Các danh sách (lấy 5 bản ghi gần nhất) =====
        public List<BaoHiemDto> BaoHiems { get; set; } = new();
        public List<TienSuBenhDto> TienSuBenhs { get; set; } = new();
        public List<LuotKhamSummaryDto> LuotKhamGanNhat { get; set; } = new();
        public List<HoaDonSummaryDto> HoaDonGanNhat { get; set; } = new();
    }

    public class TaiKhoanDto
    {
        public string Username { get; set; } = string.Empty;
        public bool HasPassword { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsLocked { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class NguoiTaoDto
    {
        public int Id { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class ThongTinTongQuanDto
    {
        public int TongLuotKham { get; set; }
        public int TongHoaDon { get; set; }
        public decimal TongTienDaThanhToan { get; set; }
        public decimal TongTienConNo { get; set; }
        public int SoLanKhamGanNhat { get; set; }
        public string TrangThaiHienTai { get; set; } = string.Empty;
    }


}