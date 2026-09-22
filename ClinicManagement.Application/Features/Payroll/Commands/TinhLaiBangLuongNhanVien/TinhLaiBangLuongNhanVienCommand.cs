using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record TinhLaiBangLuongNhanVienCommand(int BangLuongId) : IRequest<PayrollLineDto>;

public sealed class TinhLaiBangLuongNhanVienCommandHandler(IPayrollRepository repository)
    : IRequestHandler<TinhLaiBangLuongNhanVienCommand, PayrollLineDto>
{
    public async Task<PayrollLineDto> Handle(TinhLaiBangLuongNhanVienCommand command, CancellationToken cancellationToken)
    {
        var bangLuong = await repository.GetBangLuongAsync(command.BangLuongId, true, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy bảng lương với Id = {command.BangLuongId}.");

        var kyLuong = bangLuong.KyLuong
            ?? throw new InvalidOperationException("Bảng lương không thuộc kỳ lương hợp lệ.");

        if (kyLuong.TrangThai != "NHAP" && kyLuong.TrangThai != "DA_DUYET")
        {
            throw new InvalidOperationException("Chỉ có thể tính lại lương khi kỳ lương ở trạng thái Nháp hoặc Đã duyệt.");
        }

        if (!kyLuong.MaKyChamCong.HasValue)
        {
            throw new InvalidOperationException("Kỳ lương chưa liên kết kỳ chấm công.");
        }

        var attendancePeriod = await repository.GetAttendancePeriodAsync(kyLuong.MaKyChamCong.Value, cancellationToken)
            ?? throw new InvalidOperationException("Kỳ chấm công nguồn không tồn tại.");

        var employee = bangLuong.NhanVien
            ?? throw new InvalidOperationException("Không tìm thấy thông tin nhân viên của bảng lương.");

        var rows = await repository.GetAttendanceForEmployeeAsync(
            bangLuong.MaNhanVien,
            attendancePeriod.TuNgay,
            attendancePeriod.DenNgay,
            cancellationToken);

        var worked = rows.Count(a => a.TrangThai.ToString() is
            "DI_DUNG_GIO" or "DI_MUON" or "VE_SOM" or "DI_MUON_VE_SOM");
        var unpaid = rows.Count(a => a.TrangThai.ToString() == "VANG_MAT" ||
            (a.TrangThai.ToString() == "NGHI_PHEP" &&
             a.LoaiNghi == LoaiNghiPhep.KHONG_LUONG));

        var dailyRate = employee.LuongCoBan / 26m;
        var hourlyRate = dailyRate / 8m;
        var workedPay = dailyRate * worked;
        var unpaidDeduction = dailyRate * unpaid;
        var overtimeHours = rows.Sum(a =>
            Math.Max(0, a.GioLamThucTe - (a.LichLamViec?.CaTruc?.SoGioLam ?? 8)));
        var overtimePay = hourlyRate * (decimal)overtimeHours * 1.5m;
        var lateEarlyDeduction =
            hourlyRate * rows.Sum(a => a.PhutDiMuon + a.PhutVeSom) / 60m;
        var insurance = employee.LuongCoBan * employee.TyLeBaoHiem / 100m;

        bangLuong.SetAttendanceSnapshot(attendancePeriod.Id, worked, unpaid);
        bangLuong.SetPayrollSnapshot(
            workedPay,
            unpaidDeduction,
            overtimePay,
            lateEarlyDeduction,
            insurance);

        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        return AnhXaBangLuong.MapLine(bangLuong);
    }
}
