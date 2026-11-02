using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Application.Features.LichLamViec;

internal static class AnhXaChamCong
{
    public static ChamCongDto ToDto(ChamCong x) => new()
    {
        Id = x.Id,
        MaNhanVien = x.MaNhanVien,
        MaLichLamViec = x.MaLichLamViec,
        TenNhanVien = x.NhanVien?.HoTen ?? string.Empty,
        TenCa = x.LichLamViec?.CaTruc?.TenCa ?? string.Empty,
        ThoiGianBatDau = x.LichLamViec?.CaTruc?.ThoiGianBatDau,
        ThoiGianKetThuc = x.LichLamViec?.CaTruc?.ThoiGianKetThuc,
        NgayChamCong = x.NgayChamCong,
        CheckIn = x.CheckIn,
        CheckOut = x.CheckOut,
        GioLamThucTe = x.GioLamThucTe,
        PhutDiMuon = x.PhutDiMuon,
        PhutVeSom = x.PhutVeSom,
        MaKhoa = x.LichLamViec?.MaKhoa,
        TenKhoa = x.LichLamViec?.Khoa?.Ten ?? string.Empty,
        ChucDanh = x.NhanVien?.ChucVu?.TenChucVu ?? x.NhanVien?.ChuyenKhoa ?? string.Empty,
        TrangThai = x.TrangThai.ToString(),
        GhiChu = x.GhiChu
    };

    public static AttendanceAdjustmentDto ToDto(DieuChinhChamCong x) => new()
    {
        Id = x.Id,
        MaChamCong = x.MaChamCong,
        MaNhanVien = x.MaNhanVien,
        CheckInCu = x.CheckInCu,
        CheckOutCu = x.CheckOutCu,
        CheckInMoi = x.CheckInMoi,
        CheckOutMoi = x.CheckOutMoi,
        LyDo = x.LyDo,
        TrangThai = x.TrangThai.ToString(),
        NguoiDuyet = x.NguoiDuyet,
        ThoiGianDuyet = x.ThoiGianDuyet,
        GhiChuDuyet = x.GhiChuDuyet
    };

    public static AttendancePeriodDto ToDto(KyChamCong x, int soNhanVien = 0) => new()
    {
        Id = x.Id,
        TuNgay = x.TuNgay,
        DenNgay = x.DenNgay,
        DaKhoa = x.DaKhoa,
        NguoiKhoa = x.NguoiKhoa,
        ThoiGianKhoa = x.ThoiGianKhoa,
        GhiChu = x.GhiChu,
        SoNhanVien = soNhanVien
    };
}
