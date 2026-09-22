using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record LayChiTietChamCongBangLuongQuery(int BangLuongId) : IRequest<IReadOnlyList<AttendanceDrillDownItemDto>>;

public sealed class LayChiTietChamCongBangLuongQueryHandler(IPayrollRepository repository)
    : IRequestHandler<LayChiTietChamCongBangLuongQuery, IReadOnlyList<AttendanceDrillDownItemDto>>
{
    public async Task<IReadOnlyList<AttendanceDrillDownItemDto>> Handle(
        LayChiTietChamCongBangLuongQuery query,
        CancellationToken cancellationToken)
    {
        var bangLuong = await repository.GetBangLuongAsync(query.BangLuongId, true, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy bảng lương với Id = {query.BangLuongId}.");

        var kyLuong = bangLuong.KyLuong
            ?? throw new InvalidOperationException("Bảng lương không thuộc kỳ lương hợp lệ.");

        if (!kyLuong.MaKyChamCong.HasValue)
        {
            throw new InvalidOperationException("Kỳ lương chưa liên kết kỳ chấm công.");
        }

        var attendancePeriod = await repository.GetAttendancePeriodAsync(kyLuong.MaKyChamCong.Value, cancellationToken)
            ?? throw new InvalidOperationException("Kỳ chấm công nguồn không tồn tại.");

        var rows = await repository.GetAttendanceForEmployeeAsync(
            bangLuong.MaNhanVien,
            attendancePeriod.TuNgay,
            attendancePeriod.DenNgay,
            cancellationToken);

        return rows.Select(a =>
        {
            var standardHours = a.LichLamViec?.CaTruc?.SoGioLam ?? 8;
            var otHours = Math.Max(0, a.GioLamThucTe - standardHours);
            var statusStr = a.TrangThai.ToString();
            var loaiCong = statusStr switch
            {
                "DI_DUNG_GIO" => "Đi làm đúng giờ",
                "DI_MUON" => "Đi làm muộn",
                "VE_SOM" => "Về sớm",
                "DI_MUON_VE_SOM" => "Đi muộn & Về sớm",
                "NGHI_PHEP" => "Nghỉ phép",
                "VANG_MAT" => "Vắng mặt không phép",
                "THIEU_CHECK_OUT" => "Thiếu quẹt về",
                "CHO_XAC_NHAN" => "Chờ xác nhận",
                _ => statusStr
            };

            return new AttendanceDrillDownItemDto
            {
                Ngay = a.NgayChamCong,
                TenCa = a.LichLamViec?.CaTruc?.TenCa ?? "Ca chuẩn",
                GioVao = a.CheckIn,
                GioRa = a.CheckOut,
                PhutDiMuon = a.PhutDiMuon,
                PhutVeSom = a.PhutVeSom,
                SoGioLamThucTe = a.GioLamThucTe,
                SoGioOT = otHours,
                TrangThai = statusStr,
                LoaiCong = loaiCong,
                GhiChu = a.GhiChu ?? ""
            };
        }).ToList();
    }
}
