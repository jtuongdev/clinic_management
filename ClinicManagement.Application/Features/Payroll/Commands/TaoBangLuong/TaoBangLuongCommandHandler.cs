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

        var employees = await repository.GetActiveEmployeesAsync(cancellationToken);
        var records = await repository.GetAttendanceAsync(
            attendancePeriod.TuNgay,
            attendancePeriod.DenNgay,
            cancellationToken);

        var defaultRates = (await repository.GetCauHinhHoaHongLoaiDichVusAsync(cancellationToken))
            .ToDictionary(x => x.LoaiDichVu, x => x.TyLeHoaHong);

        foreach (var employee in employees)
        {
            var rows = records.Where(a => a.MaNhanVien == employee.Id).ToList();
            var workedRows = rows.Where(a => a.TrangThai.ToString() is
                "DI_DUNG_GIO" or "DI_MUON" or "VE_SOM" or "DI_MUON_VE_SOM").ToList();

            var dailyRate = employee.LuongCoBan / 26m;
            var hourlyRate = dailyRate / 8m;

            // Tính công theo giờ trong ca (về sớm tính theo số giờ thực tế trong ca, không phạt tiền về sớm)
            decimal workedCong = 0m;
            foreach (var a in workedRows)
            {
                var caHours = a.LichLamViec?.CaTruc?.SoGioLam ?? 8.0;
                if (caHours <= 0) caHours = 8.0;

                var gioTrongCa = a.PhutVeSom > 0
                    ? Math.Max(0, caHours - ((double)a.PhutVeSom / 60.0))
                    : caHours;

                workedCong += (decimal)(gioTrongCa / caHours);
            }
            workedCong = Math.Round(workedCong, 2);

            var unpaid = rows.Count(a => a.TrangThai.ToString() == "VANG_MAT" ||
                (a.TrangThai.ToString() == "NGHI_PHEP" &&
                 a.LoaiNghi == ClinicManagement.Domain.Common.Enums.LoaiNghiPhep.KHONG_LUONG));

            var line = payroll.BangLuongs.FirstOrDefault(x => x.MaNhanVien == employee.Id);
            if (line == null)
            {
                line = new BangLuong(payroll.Id, employee.Id, employee.LuongCoBan);
                payroll.BangLuongs.Add(line);
            }

            line.SetAttendanceSnapshot(attendancePeriod.Id, workedCong, unpaid);

            // Lương theo ngày công (nghỉ thì không có lương, không trừ kép)
            var workedPay = Math.Round(dailyRate * workedCong, 0);
            var unpaidDeduction = 0m;

            // Làm thêm giờ (OT x1.5)
            var overtimeHours = rows.Sum(a =>
                Math.Max(0, a.GioLamThucTe - (a.LichLamViec?.CaTruc?.SoGioLam ?? 8)));
            var overtimePay = Math.Round(hourlyRate * (decimal)overtimeHours * 1.5m, 0);

            // Phạt đi muộn: Chỉ phạt trễ không phạt sớm, trễ thì phạt 50k / lần
            var soLanDiMuon = rows.Count(a => a.PhutDiMuon > 0);
            var latePenalty = soLanDiMuon * 50_000m;

            var insurance = Math.Round(employee.LuongCoBan * employee.TyLeBaoHiem / 100m, 0);

            line.SetPayrollSnapshot(
                workedPay,
                unpaidDeduction,
                overtimePay,
                latePenalty,
                insurance);

            // Tự động tính thù lao HIS với cơ chế phân cấp (fallback tiering)
            var hisData = await repository.GetHisDataForEmployeeAsync(
                employee.Id, attendancePeriod.TuNgay, attendancePeriod.DenNgay, defaultRates, cancellationToken);
            var effectiveThuLao = employee.GetEffectiveThuLaoMoiLuot();
            var tienThuLaoKham = hisData.Count(h => h.LaHoanThanh) * effectiveThuLao;
            var tienHoaHongCls = hisData.SelectMany(h => h.DichVus).Sum(d => d.Gia * d.TyLeHoaHong / 100m);
            line.SetHisSnapshot(tienThuLaoKham, tienHoaHongCls);

            if (employee.PhuCapCoDinh > 0 && !line.ChiTiets.Any(c => c.LoaiKhoan == "PHU_CAP" && c.TenKhoan == "Phụ cấp cố định"))
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
