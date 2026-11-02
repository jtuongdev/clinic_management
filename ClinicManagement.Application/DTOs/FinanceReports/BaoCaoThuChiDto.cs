using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.FinanceReports;

public class TongQuanThuChiDto
{
    public decimal TongThu { get; set; }
    public decimal TongChi { get; set; }
    public decimal DongTienRong { get; set; }
    public decimal DoanhThuThuan { get; set; }
    public decimal GiaVonHangBan { get; set; }
    public decimal ChiPhiNhanSu { get; set; }
    public decimal LoiNhuanGopUocTinh { get; set; }
    public double TySuatLoiNhuanGop { get; set; }
}

public class PhanBoPhuongThucThuDto
{
    public string PhuongThuc { get; set; } = string.Empty;
    public string TenPhuongThuc { get; set; } = string.Empty;
    public decimal SoTien { get; set; }
    public int SoGiaoDich { get; set; }
    public double TyTrong { get; set; }
}

public class CoCauChiPhiDto
{
    public string KhoanMuc { get; set; } = string.Empty;
    public decimal SoTien { get; set; }
    public double TyTrong { get; set; }
}

public class ThuChiTheoThoiGianDto
{
    public string MocThoiGian { get; set; } = string.Empty;
    public decimal TienThu { get; set; }
    public decimal TienChi { get; set; }
    public decimal DongTienRong { get; set; }
}

public class BaoCaoThuChiResponseDto
{
    public TongQuanThuChiDto TongQuan { get; set; } = new();
    public List<PhanBoPhuongThucThuDto> PhanBoThu { get; set; } = new();
    public List<CoCauChiPhiDto> CoCauChi { get; set; } = new();
    public List<ThuChiTheoThoiGianDto> TheoThoiGian { get; set; } = new();
}
