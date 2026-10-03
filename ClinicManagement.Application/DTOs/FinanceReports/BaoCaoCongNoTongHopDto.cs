using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.FinanceReports;

public class TongQuanCongNoDto
{
    public decimal TongPhaiThuBenhNhan { get; set; }
    public decimal PhaiThuTrongHan { get; set; }
    public decimal PhaiThuQuaHan { get; set; }
    public decimal TongPhaiTraNhaCungCap { get; set; }
    public decimal PhaiTraTrongHan { get; set; }
    public decimal PhaiTraQuaHan { get; set; }
    public decimal ChenhLechCongNo { get; set; }
    public int SoBenhNhanNo { get; set; }
    public int SoNhaCungCapNo { get; set; }
}

public class PhanBoTuoiNoDto
{
    public string NhomTuoi { get; set; } = string.Empty; // "Dưới 30 ngày", "31 - 60 ngày", "61 - 90 ngày", "Trên 90 ngày"
    public decimal SoTienPhaiThu { get; set; }
    public decimal SoTienPhaiTra { get; set; }
    public double TyTrongPhaiThu { get; set; }
    public double TyTrongPhaiTra { get; set; }
}

public class TopBenhNhanNoDto
{
    public int MaBenhNhan { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public decimal SoTienNo { get; set; }
    public decimal SoTienDaTra { get; set; }
    public decimal SoTienConLai { get; set; }
    public DateTime? HanThanhToan { get; set; }
    public int SoNgayQuaHan { get; set; }
    public string TrangThai { get; set; } = string.Empty;
}

public class TopNhaCungCapNoDto
{
    public int MaNhaCungCap { get; set; }
    public string MaNcc { get; set; } = string.Empty;
    public string TenNhaCungCap { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public decimal TongTienHang { get; set; }
    public decimal SoTienDaTra { get; set; }
    public decimal SoTienConLai { get; set; }
    public DateTime HanThanhToan { get; set; }
    public int SoNgayQuaHan { get; set; }
    public string TrangThai { get; set; } = string.Empty;
}

public class BaoCaoCongNoResponseDto
{
    public TongQuanCongNoDto TongQuan { get; set; } = new();
    public List<PhanBoTuoiNoDto> PhanBoTuoiNo { get; set; } = new();
    public List<TopBenhNhanNoDto> TopBenhNhanNo { get; set; } = new();
    public List<TopNhaCungCapNoDto> TopNhaCungCapNo { get; set; } = new();
}
