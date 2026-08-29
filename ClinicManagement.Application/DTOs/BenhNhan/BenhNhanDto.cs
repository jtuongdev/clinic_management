using ClinicManagement.Domain.Common.Enums;
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class BenhNhanDto
    {
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
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public string TenCoSo { get; set; } = string.Empty;
        public string TenKhoa { get; set; } = string.Empty;
        public string TrangThaiLuotKham { get; set; } = string.Empty; 
        public List<TienSuBenhDto> TienSuBenhs { get; set; } = new();
        public List<BaoHiemDto> BaoHiems { get; set; } = new();
    }

    public class TienSuBenhDto
    {
        public int Id { get; set; }
        public string LoaiTienSu { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
        public DateTime NgayGhiNhan { get; set; }
    }

    public class BaoHiemDto
    {
        public int Id { get; set; }
        public string LoaiBaoHiem { get; set; } = string.Empty;
        public string TenNhaCungCap { get; set; } = string.Empty;
        public string SoThe { get; set; } = string.Empty;
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public decimal MucHuong { get; set; }
        public bool IsValid { get; set; }
    }
}