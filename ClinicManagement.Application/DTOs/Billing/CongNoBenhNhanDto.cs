using System;
using System.Collections.Generic;
using ClinicManagement.Application.DTOs.Common;

namespace ClinicManagement.Application.DTOs.Billing;

public class CongNoBenhNhanChiTietDto
{
    public int Id { get; set; }
    public int MaBenhNhan { get; set; }
    public string TenBenhNhan { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string SoCCCD { get; set; } = string.Empty;
    public int MaHoaDon { get; set; }
    public string SoHoaDon { get; set; } = string.Empty;
    public DateTime NgayLapHoaDon { get; set; }
    public int MaCoSo { get; set; }
    public decimal TongTienHoaDon { get; set; }
    public decimal SoTienNo { get; set; }
    public decimal SoTienDaTra { get; set; }
    public decimal SoTienConLai { get; set; }
    public DateTime? HanThanhToan { get; set; }
    public string TrangThai { get; set; } = string.Empty; // DANG_NO, QUA_HAN, DA_TAT_TOAN
    public string TrangThaiTen { get; set; } = string.Empty;
    public int SoNgayQuaHan { get; set; }
}

public class TongQuanCongNoBenhNhanDto
{
    public decimal TongCongNo { get; set; }
    public decimal TongNoQuaHan { get; set; }
    public decimal TongDaThanhToan { get; set; }
    public int SoKhoanNo { get; set; }
    public int SoKhoanQuaHan { get; set; }
    public int SoBenhNhanConNo { get; set; }
    public int TongSoKhoan { get; set; }
}

public class DanhSachCongNoBenhNhanResponseDto
{
    public PagedResult<CongNoBenhNhanChiTietDto> DanhSach { get; set; } = new();
    public TongQuanCongNoBenhNhanDto TongQuan { get; set; } = new();
}
