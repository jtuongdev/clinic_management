using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class ChiDinhDichVuChiTietDto
    {
        public int Id { get; set; }
        public int MaLuotKham { get; set; }
        public int MaBenhNhan { get; set; }
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public string TenBenhNhan { get; set; } = string.Empty;
        public int? Tuoi { get; set; }
        public string GioiTinh { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public int MaDanhMucDichVu { get; set; }
        public string TenDichVu { get; set; } = string.Empty;
        public string LoaiDichVu { get; set; } = string.Empty;
        public int MaBacSiChiDinh { get; set; }
        public string TenBacSiChiDinh { get; set; } = string.Empty;
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public int? MaNguoiThucHien { get; set; }
        public string TenNguoiThucHien { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayChiDinh { get; set; }
        public DateTime? NgayTiepNhan { get; set; }
        public DateTime? NgayThucHien { get; set; }
        public DateTime? NgayCoKetQua { get; set; }
        public string KetLuan { get; set; } = string.Empty;
        public string UrlKetQua { get; set; } = string.Empty;
        public string ChanDoanSoBo { get; set; } = string.Empty;
        public List<ChiTietKetQuaXetNghiemDto> ChiTietKetQuas { get; set; } = new();
        public List<VatTuSuDungDto> VatTuSuDungs { get; set; } = new();
    }

    public class VatTuSuDungDto
    {
        public int MaItem { get; set; }
        public string MaVatTu { get; set; } = string.Empty;
        public string TenVatTu { get; set; } = string.Empty;
        public decimal SoLuongDinhMuc { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
        public decimal SoLuongXuat { get; set; }
        public string DonViTinhKho { get; set; } = string.Empty;
        public string SoLo { get; set; } = string.Empty;
        public string MaPhieuXuat { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
    }
}
