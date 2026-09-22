using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Payroll;

namespace ClinicManagement.Application.Features.Payroll;

public static class AnhXaBangLuong
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

    public static PayrollDetailDto Detail(KyLuong x)
    {
        var lines = x.BangLuongs.Select(MapLine).ToList();
        var kpi = new PayrollSummaryKpiDto
        {
            SoNhanVien = lines.Count,
            TongQuyLuong = lines.Sum(l => l.LuongTheoNgayCong + l.TienTangCa + l.TongPhuCap),
            TongLuongCoBan = lines.Sum(l => l.LuongCoBan),
            TongLamThemOT = lines.Sum(l => l.TienTangCa),
            TongBaoHiem = lines.Sum(l => l.TienBaoHiem),
            TongThucLinh = lines.Sum(l => l.ThucLinh),
            TongPhuCap = lines.Sum(l => l.TongPhuCap),
            TongKhauTru = lines.Sum(l => l.TongKhauTru + l.KhauTruNghiKhongLuong + l.KhauTruDiMuonVeSom + l.TienBaoHiem),
            SoNhanVienPhatSinhNo = lines.Count(l => l.TienNoKyNay > 0),
            TongTienNoKyNay = lines.Sum(l => l.TienNoKyNay)
        };

        return new PayrollDetailDto
        {
            Id = x.Id,
            Thang = x.Thang,
            Nam = x.Nam,
            TuNgay = x.TuNgay,
            DenNgay = x.DenNgay,
            MaKyChamCong = x.MaKyChamCong,
            TrangThai = x.TrangThai,
            SoBangLuong = x.BangLuongs.Count,
            SoNhanVienPhatSinhNo = kpi.SoNhanVienPhatSinhNo,
            TongTienNoKyNay = kpi.TongTienNoKyNay,
            BangLuongs = lines,
            Kpi = kpi
        };
    }

    public static PayrollLineDto MapLine(BangLuong b) => new()
    {
        Id = b.Id,
        MaKyLuong = b.MaKyLuong,
        Thang = b.KyLuong?.Thang ?? 0,
        Nam = b.KyLuong?.Nam ?? 0,
        TrangThaiKyLuong = b.KyLuong?.TrangThai ?? "",
        MaNhanVien = b.MaNhanVien,
        TenNhanVien = b.NhanVien?.HoTen ?? "",
        TenKhoa = b.NhanVien?.NhanVienKhoa?.Select(k => k.Khoa?.Ten).FirstOrDefault(t => !string.IsNullOrEmpty(t)) ?? b.NhanVien?.ChuyenKhoa ?? "",
        ChucDanh = b.NhanVien?.ChucVu?.TenChucVu ?? "",
        MaChucVu = b.NhanVien?.MaChucVu,
        LuongCoBan = b.LuongCoBan,
        SoNgayCong = b.SoNgayCong,
        SoNgayNghiKhongLuong = b.SoNgayNghiKhongLuong,
        TongPhuCap = b.TongPhuCap,
        TongKhauTru = b.TongKhauTru,
        ThucLinh = b.ThucLinh,
        TienNoKyNay = b.TienNoKyNay,
        LuongTheoNgayCong = b.LuongTheoNgayCong,
        KhauTruNghiKhongLuong = b.KhauTruNghiKhongLuong,
        TienTangCa = b.TienTangCa,
        KhauTruDiMuonVeSom = b.KhauTruDiMuonVeSom,
        TienBaoHiem = b.TienBaoHiem,
        ChiTiets = b.ChiTiets?.Select(c => new ChiTietBangLuongDto
        {
            Id = c.Id,
            MaBangLuong = c.MaBangLuong,
            LoaiKhoan = c.LoaiKhoan,
            TenKhoan = c.TenKhoan,
            SoTien = c.SoTien,
            GhiChu = c.GhiChu
        }).ToList() ?? []
    };
}
