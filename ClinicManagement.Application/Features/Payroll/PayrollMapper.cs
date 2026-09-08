using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Payroll;

namespace ClinicManagement.Application.Features.Payroll;

public static class PayrollMapper
{
    public static PayrollPeriodDto Map(KyLuong x) => new()
    {
        Id = x.Id,
        Thang = x.Thang,
        Nam = x.Nam,
        TuNgay = x.TuNgay,
        DenNgay = x.DenNgay,
        MaKyChamCong = x.MaKyChamCong,
        TrangThai = x.TrangThai,
        SoBangLuong = x.BangLuongs?.Count ?? 0
    };

    public static PayrollDetailDto Detail(KyLuong x) => new()
    {
        Id = x.Id,
        Thang = x.Thang,
        Nam = x.Nam,
        TuNgay = x.TuNgay,
        DenNgay = x.DenNgay,
        MaKyChamCong = x.MaKyChamCong,
        TrangThai = x.TrangThai,
        SoBangLuong = x.BangLuongs.Count,
        BangLuongs = x.BangLuongs.Select(b => new PayrollLineDto
        {
            Id = b.Id,
            MaNhanVien = b.MaNhanVien,
            TenNhanVien = b.NhanVien?.HoTen ?? "",
            LuongCoBan = b.LuongCoBan,
            SoNgayCong = b.SoNgayCong,
            SoNgayNghiKhongLuong = b.SoNgayNghiKhongLuong,
            TongPhuCap = b.TongPhuCap,
            TongKhauTru = b.TongKhauTru,
            ThucLinh = b.ThucLinh,
            LuongTheoNgayCong = b.LuongTheoNgayCong,
            KhauTruNghiKhongLuong = b.KhauTruNghiKhongLuong,
            TienTangCa = b.TienTangCa,
            KhauTruDiMuonVeSom = b.KhauTruDiMuonVeSom,
            TienBaoHiem = b.TienBaoHiem
        }).ToList()
    };
}
