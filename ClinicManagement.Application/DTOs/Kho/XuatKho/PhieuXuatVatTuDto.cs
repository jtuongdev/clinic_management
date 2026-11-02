using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.Kho.XuatKho;

public class PhieuXuatVatTuDto
{
    public int Id { get; set; }
    public string MaPhieu { get; set; } = string.Empty;
    public string LoaiXuat { get; set; } = string.Empty;
    public int MaKhoXuat { get; set; }
    public string TenKhoXuat { get; set; } = string.Empty;
    public DateTime NgayXuat { get; set; }
    public int MaNguoiXuat { get; set; }
    public string TenNguoiXuat { get; set; } = string.Empty;
    public string GhiChu { get; set; } = string.Empty;
    public int? MaDonThuoc { get; set; }
    public int SoLuongMatHang { get; set; }
    public decimal TongSoLuongXuat { get; set; }
    public decimal TongTienXuat { get; set; }
    public List<ChiTietXuatVatTuDto> ChiTiets { get; set; } = new();
}

public class ChiTietXuatVatTuDto
{
    public int Id { get; set; }
    public int MaItem { get; set; }
    public string MaItemCode { get; set; } = string.Empty;
    public string TenItem { get; set; } = string.Empty;
    public string LoaiItem { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public string SoLo { get; set; } = string.Empty;
    public DateTime? HanSuDung { get; set; }
    public decimal SoLuongXuat { get; set; }
    public decimal DonGiaXuat { get; set; }
    public decimal ThanhTien { get; set; }
}
