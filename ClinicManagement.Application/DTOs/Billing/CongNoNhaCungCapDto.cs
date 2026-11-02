using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.RegularExpressions;
using ClinicManagement.Application.DTOs.Common;

namespace ClinicManagement.Application.DTOs.Billing;

public class CongNoNhaCungCapDto
{
    public int Id { get; set; }
    public string MaPhieuNhap { get; set; } = string.Empty;
    public int MaNhaCungCap { get; set; }
    public string MaNcc { get; set; } = string.Empty;
    public string TenNhaCungCap { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public int MaCoSo { get; set; }
    public int MaKho { get; set; }
    public DateTime NgayNhap { get; set; }
    public DateTime HanThanhToan { get; set; }
    public decimal TongTien { get; set; }
    public decimal SoTienDaTra { get; set; }
    public decimal SoTienConLai { get; set; }
    public string TrangThai { get; set; } = "DANG_NO"; // DANG_NO, QUA_HAN, DA_TAT_TOAN
    public string TrangThaiTen { get; set; } = "Đang nợ";
    public int SoNgayQuaHan { get; set; }
    public string? GhiChu { get; set; }
    public List<LichSuThanhToanNhaCungCapDto> LichSuThanhToan { get; set; } = new();
}

public class LichSuThanhToanNhaCungCapDto
{
    public int Lan { get; set; }
    public decimal SoTien { get; set; }
    public string NgayThanhToan { get; set; } = string.Empty;
    public string PhuongThuc { get; set; } = "TIEN_MAT";
    public string? GhiChu { get; set; }
}

public class TongQuanCongNoNhaCungCapDto
{
    public decimal TongCongNo { get; set; }
    public decimal TongNoQuaHan { get; set; }
    public decimal TongDaThanhToan { get; set; }
    public int SoPhieuChuaThanhToan { get; set; }
    public int SoPhieuQuaHan { get; set; }
    public int SoNhaCungCapConNo { get; set; }
    public int TongSoPhieu { get; set; }
}

public class DanhSachCongNoNhaCungCapResponseDto
{
    public PagedResult<CongNoNhaCungCapDto> DanhSach { get; set; } = new();
    public TongQuanCongNoNhaCungCapDto TongQuan { get; set; } = new();
}

public class ThanhToanCongNoNhaCungCapRequest
{
    public int MaPhieuNhap { get; set; }
    public decimal SoTienThanhToan { get; set; }
    public string PhuongThucThanhToan { get; set; } = "CHUYEN_KHOAN";
    public string? GhiChu { get; set; }
}

public static class SupplierPaymentHelper
{
    private static readonly Regex PaymentRegex = new(
        @"\[PAID:(?<amount>\d+(\.\d+)?)\|DATE:(?<date>[^|]+)\|METHOD:(?<method>[^|]+)(?:\|NOTE:(?<note>[^\]]*))?\]",
        RegexOptions.Compiled);

    public static decimal ParsePaidAmount(string? ghiChu)
    {
        if (string.IsNullOrWhiteSpace(ghiChu)) return 0;
        decimal total = 0;
        var matches = PaymentRegex.Matches(ghiChu);
        foreach (Match match in matches)
        {
            if (decimal.TryParse(match.Groups["amount"].Value, CultureInfo.InvariantCulture, out var amt))
            {
                total += amt;
            }
        }
        return total;
    }

    public static List<LichSuThanhToanNhaCungCapDto> ParsePaymentHistory(string? ghiChu)
    {
        var list = new List<LichSuThanhToanNhaCungCapDto>();
        if (string.IsNullOrWhiteSpace(ghiChu)) return list;
        var matches = PaymentRegex.Matches(ghiChu);
        int index = 1;
        foreach (Match match in matches)
        {
            if (decimal.TryParse(match.Groups["amount"].Value, CultureInfo.InvariantCulture, out var amt))
            {
                list.Add(new LichSuThanhToanNhaCungCapDto
                {
                    Lan = index++,
                    SoTien = amt,
                    NgayThanhToan = match.Groups["date"].Value,
                    PhuongThuc = match.Groups["method"].Value,
                    GhiChu = match.Groups["note"].Value
                });
            }
        }
        return list;
    }

    public static string CleanGhiChu(string? ghiChu)
    {
        if (string.IsNullOrWhiteSpace(ghiChu)) return string.Empty;
        var cleaned = PaymentRegex.Replace(ghiChu, string.Empty);
        return cleaned.Trim();
    }

    public static string AppendPaymentRecord(string? existingGhiChu, decimal amount, string method, string? note)
    {
        var record = $"[PAID:{amount.ToString(CultureInfo.InvariantCulture)}|DATE:{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}|METHOD:{method}|NOTE:{note ?? string.Empty}]";
        return string.IsNullOrWhiteSpace(existingGhiChu) ? record : $"{existingGhiChu}\n{record}";
    }
}
