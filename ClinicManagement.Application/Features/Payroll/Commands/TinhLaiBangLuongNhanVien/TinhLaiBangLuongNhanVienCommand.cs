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
             a.LoaiNghi == LoaiNghiPhep.KHONG_LUONG));

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

        bangLuong.SetAttendanceSnapshot(attendancePeriod.Id, workedCong, unpaid);
        bangLuong.SetPayrollSnapshot(
            workedPay,
            unpaidDeduction,
            overtimePay,
            latePenalty,
            insurance);

        // Tự động tính thù lao HIS với cơ chế phân cấp (fallback tiering)
        var hisData = await repository.GetHisDataForEmployeeAsync(
            bangLuong.MaNhanVien, attendancePeriod.TuNgay, attendancePeriod.DenNgay, null, cancellationToken);
        var effectiveThuLao = employee.GetEffectiveThuLaoMoiLuot();
        var tienThuLaoKham = hisData.Count(h => h.LaHoanThanh) * effectiveThuLao;
        var tienHoaHongCls = hisData.SelectMany(h => h.DichVus).Sum(d => d.Gia * d.TyLeHoaHong / 100m);
        if (tienThuLaoKham > 0 || tienHoaHongCls > 0)
            bangLuong.SetHisSnapshot(tienThuLaoKham, tienHoaHongCls);

        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        return AnhXaBangLuong.MapLine(bangLuong);
    }
}
