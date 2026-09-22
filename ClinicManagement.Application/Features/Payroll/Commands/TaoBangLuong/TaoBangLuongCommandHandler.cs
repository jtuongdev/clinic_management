using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ClinicManagement.Application.Features.Payroll;

public sealed class GeneratePayrollHandler(IPayrollRepository repository, ILogger<GeneratePayrollHandler>? logger = null)
    : IRequestHandler<GeneratePayrollCommand, PayrollDetailDto>
{
    public async Task<PayrollDetailDto> Handle(
        GeneratePayrollCommand command,
        CancellationToken cancellationToken)
    {
        var payroll = await repository.GetPeriodAsync(
            command.Id, true, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy kỳ lương.");

        if (payroll.TrangThai != "NHAP")
            throw new InvalidOperationException(
                "Kỳ lương đã được duyệt hoặc đóng, không thể tạo lại.");
        if (!payroll.MaKyChamCong.HasValue)
            throw new InvalidOperationException("Kỳ lương chưa liên kết kỳ chấm công.");

        var attendancePeriod = await repository.GetAttendancePeriodAsync(
            payroll.MaKyChamCong.Value, cancellationToken)
            ?? throw new InvalidOperationException(
                "Kỳ chấm công nguồn không tồn tại.");
        if (!attendancePeriod.DaKhoa)
            throw new InvalidOperationException(
                "Chỉ kỳ chấm công đã khóa mới được tạo bảng lương.");
        if (payroll.BangLuongs.Count > 0)
            throw new InvalidOperationException("Kỳ lương đã được tạo bảng lương.");

        var employees = await repository.GetActiveEmployeesAsync(cancellationToken);
        var records = await repository.GetAttendanceAsync(
            attendancePeriod.TuNgay,
            attendancePeriod.DenNgay,
            cancellationToken);

        foreach (var employee in employees)
        {
            var rows = records.Where(a => a.MaNhanVien == employee.Id).ToList();
            var worked = rows.Count(a => a.TrangThai.ToString() is
                "DI_DUNG_GIO" or "DI_MUON" or "VE_SOM" or "DI_MUON_VE_SOM");
            var unpaid = rows.Count(a => a.TrangThai.ToString() == "VANG_MAT" ||
                (a.TrangThai.ToString() == "NGHI_PHEP" &&
                 a.LoaiNghi == ClinicManagement.Domain.Common.Enums.LoaiNghiPhep.KHONG_LUONG));

            var line = new BangLuong(payroll.Id, employee.Id, employee.LuongCoBan);
            line.SetAttendanceSnapshot(attendancePeriod.Id, worked, unpaid);
            payroll.BangLuongs.Add(line);

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

            line.SetPayrollSnapshot(
                workedPay,
                unpaidDeduction,
                overtimePay,
                lateEarlyDeduction,
                insurance);
            if (employee.PhuCapCoDinh > 0)
                line.AddItem("PHU_CAP", "Phụ cấp cố định", employee.PhuCapCoDinh);

            if (line.TienNoKyNay > 0)
            {
                logger?.LogWarning("Nhân viên {HoTen} (ID: {MaNhanVien}) phát sinh dư nợ khấu trừ kỳ này: {TienNoKyNay:N0} đ",
                    employee.HoTen, employee.Id, line.TienNoKyNay);
            }
        }

        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return AnhXaBangLuong.Detail(payroll);
    }
}
