using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Application.Features.Billing;

internal static class BillingMapper
{
    public static HoaDonDetailDto ToDetail(HoaDon invoice) => new()
    {
        Id = invoice.Id,
        SoHoaDon = invoice.SoHoaDon,
        MaLuotKham = invoice.MaLuotKham,
        MaBenhNhan = invoice.MaBenhNhan,
        TenBenhNhan = invoice.BenhNhan != null ? $"{invoice.BenhNhan.Ho} {invoice.BenhNhan.Ten}".Trim() : string.Empty,
        NgayLap = invoice.NgayLap,
        TongTien = invoice.TongTien,
        SoTienBaoHiemChiTra = invoice.SoTienBaoHiemChiTra,
        SoTienBenhNhanChiTra = invoice.SoTienBenhNhanChiTra,
        DaThanhToan = invoice.DaThanhToan,
        TrangThai = invoice.TrangThai.ToString(),
        GhiChu = invoice.GhiChu,
        ChiTiet = invoice.ChiTietHoaDons.Select(item => new ChiTietHoaDonDto
        {
            Id = item.Id,
            LoaiDoiTuong = item.LoaiDoiTuong,
            MoTa = item.MoTa,
            SoLuong = item.SoLuong,
            DonGia = item.DonGia,
            ThanhTien = item.ThanhTien
        }).ToList(),
        PhieuThus = invoice.PhieuThus.Select(payment => new PhieuThuDto
        {
            Id = payment.Id,
            SoPhieuThu = payment.SoPhieuThu,
            SoTien = payment.SoTien,
            NgayThu = payment.NgayThu,
            PhuongThuc = payment.PhuongThuc.ToString(),
            NguoiThu = payment.NguoiThu?.HoTen ?? string.Empty,
            GhiChu = payment.GhiChu
        }).ToList(),
        CongNo = invoice.CongNoBenhNhan is null ? null : new CongNoDto
        {
            Id = invoice.CongNoBenhNhan.Id,
            MaBenhNhan = invoice.CongNoBenhNhan.MaBenhNhan,
            MaHoaDon = invoice.CongNoBenhNhan.MaHoaDon,
            SoTienNo = invoice.CongNoBenhNhan.SoTienNo,
            SoTienDaTra = invoice.CongNoBenhNhan.SoTienDaTra,
            SoTienConLai = invoice.CongNoBenhNhan.SoTienConLai,
            TrangThai = invoice.CongNoBenhNhan.TrangThai.ToString(),
            HanThanhToan = invoice.CongNoBenhNhan.HanThanhToan
        }
    };

    public static HoaDonListDto ToListItem(HoaDon invoice) => new()
    {
        Id = invoice.Id,
        SoHoaDon = invoice.SoHoaDon,
        MaLuotKham = invoice.MaLuotKham,
        MaBenhNhan = invoice.MaBenhNhan,
        MaBenhNhanNoiBo = $"BN-{invoice.MaBenhNhan:D5}",
        TenBenhNhan = invoice.BenhNhan != null ? $"{invoice.BenhNhan.Ho} {invoice.BenhNhan.Ten}".Trim() : string.Empty,
        MaCoSo = invoice.MaCoSo,
        NgayLap = invoice.NgayLap,
        TongTien = invoice.TongTien,
        SoTienBaoHiemChiTra = invoice.SoTienBaoHiemChiTra,
        DaThanhToan = invoice.DaThanhToan,
        TrangThai = invoice.TrangThai.ToString(),
        GhiChu = invoice.GhiChu
    };
}
