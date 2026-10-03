using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.FinanceReports;

public class TongQuanDoanhThuDto
{
    public decimal TongDoanhThu { get; set; }
    public decimal DoanhThuThucThu { get; set; }
    public decimal BHYTChiTra { get; set; }
    public decimal BenhNhanChiTra { get; set; }
    public decimal ChuaThanhToan { get; set; }
    public int SoLuongHoaDon { get; set; }
    public int SoHoaDonDaThanhToan { get; set; }
    public int SoHoaDonChuaThanhToan { get; set; }
    public decimal GiaTriTrungBinhHoaDon { get; set; }
}

public class CoCauDoanhThuDto
{
    public decimal DoanhThuThuoc { get; set; }
    public decimal DoanhThuDichVu { get; set; }
    public decimal DoanhThuVatTu { get; set; }
    public decimal DoanhThuKham { get; set; }
    public double TyLeThuoc { get; set; }
    public double TyLeDichVu { get; set; }
    public double TyLeVatTu { get; set; }
    public double TyLeKham { get; set; }
}

public class DoanhThuTheoKhoaDto
{
    public int MaKhoa { get; set; }
    public string TenKhoa { get; set; } = string.Empty;
    public int SoLuotKham { get; set; }
    public decimal DoanhThu { get; set; }
    public double TyTrong { get; set; }
}

public class DoanhThuTheoCoSoDto
{
    public int MaCoSo { get; set; }
    public string TenCoSo { get; set; } = string.Empty;
    public int SoHoaDon { get; set; }
    public decimal DoanhThu { get; set; }
    public decimal DaThu { get; set; }
    public double TyTrong { get; set; }
}

public class DoanhThuTheoThoiGianDto
{
    public string MocThoiGian { get; set; } = string.Empty;
    public decimal TongDoanhThu { get; set; }
    public decimal ThucThu { get; set; }
    public decimal BHYT { get; set; }
    public int SoHoaDon { get; set; }
}

public class TopDichVuDoanhThuDto
{
    public int Id { get; set; }
    public string MaDichVu { get; set; } = string.Empty;
    public string TenDichVu { get; set; } = string.Empty;
    public string Loai { get; set; } = string.Empty;
    public decimal SoLuong { get; set; }
    public decimal DoanhThu { get; set; }
}

public class BaoCaoDoanhThuResponseDto
{
    public TongQuanDoanhThuDto TongQuan { get; set; } = new();
    public CoCauDoanhThuDto CoCau { get; set; } = new();
    public List<DoanhThuTheoThoiGianDto> TheoThoiGian { get; set; } = new();
    public List<DoanhThuTheoKhoaDto> TheoKhoa { get; set; } = new();
    public List<DoanhThuTheoCoSoDto> TheoCoSo { get; set; } = new();
    public List<TopDichVuDoanhThuDto> TopDichVu { get; set; } = new();
}
