using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public record CreatePayrollPeriodCommand(CreatePayrollPeriodRequest Request) : IRequest<PayrollPeriodDto>;
public record GetPayrollPeriodsQuery : IRequest<IReadOnlyList<PayrollPeriodDto>>;
public record GetPayrollPeriodQuery(int Id) : IRequest<PayrollDetailDto>;
public record GeneratePayrollCommand(int Id) : IRequest<PayrollDetailDto>;
public record ApprovePayrollCommand(int Id) : IRequest<PayrollPeriodDto>;
public record ClosePayrollCommand(int Id) : IRequest<PayrollPeriodDto>;
public record PayPayrollCommand(int Id) : IRequest<PayrollPeriodDto>;

public static class PayrollMapper
{
    public static PayrollPeriodDto Map(KyLuong x) => new() { Id=x.Id, Thang=x.Thang, Nam=x.Nam, TuNgay=x.TuNgay, DenNgay=x.DenNgay, MaKyChamCong=x.MaKyChamCong, TrangThai=x.TrangThai, SoBangLuong=x.BangLuongs?.Count ?? 0 };
    public static PayrollDetailDto Detail(KyLuong x) => new() { Id=x.Id, Thang=x.Thang, Nam=x.Nam, TuNgay=x.TuNgay, DenNgay=x.DenNgay, MaKyChamCong=x.MaKyChamCong, TrangThai=x.TrangThai, SoBangLuong=x.BangLuongs.Count, BangLuongs=x.BangLuongs.Select(b => new PayrollLineDto { Id=b.Id, MaNhanVien=b.MaNhanVien, TenNhanVien=b.NhanVien?.HoTen ?? "", LuongCoBan=b.LuongCoBan, SoNgayCong=b.SoNgayCong, SoNgayNghiKhongLuong=b.SoNgayNghiKhongLuong, TongPhuCap=b.TongPhuCap, TongKhauTru=b.TongKhauTru, ThucLinh=b.ThucLinh, LuongTheoNgayCong=b.LuongTheoNgayCong, KhauTruNghiKhongLuong=b.KhauTruNghiKhongLuong, TienTangCa=b.TienTangCa, KhauTruDiMuonVeSom=b.KhauTruDiMuonVeSom, TienBaoHiem=b.TienBaoHiem }).ToList() };
}

public sealed class PayrollHandlers(IPayrollRepository repository) :
    IRequestHandler<CreatePayrollPeriodCommand, PayrollPeriodDto>,
    IRequestHandler<GetPayrollPeriodsQuery, IReadOnlyList<PayrollPeriodDto>>,
    IRequestHandler<GetPayrollPeriodQuery, PayrollDetailDto>,
    IRequestHandler<GeneratePayrollCommand, PayrollDetailDto>,
    IRequestHandler<ApprovePayrollCommand, PayrollPeriodDto>,
    IRequestHandler<ClosePayrollCommand, PayrollPeriodDto>,
    IRequestHandler<PayPayrollCommand, PayrollPeriodDto>
{
    public async Task<PayrollPeriodDto> Handle(CreatePayrollPeriodCommand c, CancellationToken ct)
    {
        var r=c.Request;
        if (await repository.PayrollPeriodExistsAsync(r.Thang, r.Nam, ct))
            throw new InvalidOperationException($"Kỳ lương tháng {r.Thang}/{r.Nam} đã tồn tại.");
        var attendance=await repository.GetAttendancePeriodAsync(r.MaKyChamCong,ct) ?? throw new KeyNotFoundException("Không tìm thấy kỳ chấm công.");
        if (!attendance.DaKhoa)
            throw new InvalidOperationException("Chỉ kỳ chấm công đã khóa mới được tạo kỳ lương.");
        if (attendance.TuNgay.Date != r.TuNgay.Date || attendance.DenNgay.Date != r.DenNgay.Date)
            throw new InvalidOperationException($"Khoảng tính lương phải trùng kỳ chấm công đã chọn: {attendance.TuNgay:dd/MM/yyyy} - {attendance.DenNgay:dd/MM/yyyy}.");
        var x=new KyLuong(r.Thang,r.Nam,r.TuNgay,r.DenNgay); x.LinkAttendancePeriod(r.MaKyChamCong);
        await repository.AddPeriodAsync(x,ct); await repository.UnitOfWork.SaveChangesAsync(ct); return PayrollMapper.Map(x);
    }
    public async Task<IReadOnlyList<PayrollPeriodDto>> Handle(GetPayrollPeriodsQuery c, CancellationToken ct) => (await repository.GetPeriodsAsync(ct)).Select(PayrollMapper.Map).ToList();
    public async Task<PayrollDetailDto> Handle(GetPayrollPeriodQuery c, CancellationToken ct) => PayrollMapper.Detail(await repository.GetPeriodAsync(c.Id,true,ct) ?? throw new KeyNotFoundException("Không tìm thấy kỳ lương."));
    public async Task<PayrollDetailDto> Handle(GeneratePayrollCommand c, CancellationToken ct)
    {
        var x=await repository.GetPeriodAsync(c.Id,true,ct) ?? throw new KeyNotFoundException("Không tìm thấy kỳ lương.");
        if (x.TrangThai!="NHAP") throw new InvalidOperationException("Kỳ lương đã được duyệt hoặc đóng, không thể tạo lại.");
        if (!x.MaKyChamCong.HasValue) throw new InvalidOperationException("Kỳ lương chưa liên kết kỳ chấm công.");
        var attendancePeriod=await repository.GetAttendancePeriodAsync(x.MaKyChamCong.Value,ct) ?? throw new InvalidOperationException("Kỳ chấm công nguồn không tồn tại.");
        if (!attendancePeriod.DaKhoa) throw new InvalidOperationException("Chỉ kỳ chấm công đã khóa mới được tạo bảng lương.");
        if (x.BangLuongs.Count > 0) throw new InvalidOperationException("Kỳ lương đã được tạo bảng lương.");
        var employees=await repository.GetActiveEmployeesAsync(ct); var records=await repository.GetAttendanceAsync(attendancePeriod.TuNgay,attendancePeriod.DenNgay,ct);
        foreach(var employee in employees) {
            var rows=records.Where(a=>a.MaNhanVien==employee.Id).ToList();
            var worked=rows.Count(a=>a.TrangThai.ToString() is "DI_DUNG_GIO" or "DI_MUON" or "VE_SOM" or "DI_MUON_VE_SOM");
            var unpaid=rows.Count(a=>a.TrangThai.ToString() == "VANG_MAT" ||
                (a.TrangThai.ToString() == "NGHI_PHEP" && a.LoaiNghi == ClinicManagement.Domain.Common.Enums.LoaiNghiPhep.KHONG_LUONG));
            var line=new BangLuong(x.Id,employee.Id,employee.LuongCoBan);
            line.SetAttendanceSnapshot(attendancePeriod.Id,worked,unpaid); x.BangLuongs.Add(line);
            var dailyRate = employee.LuongCoBan / 26m;
            var hourlyRate = dailyRate / 8m;
            var workedPay = dailyRate * worked;
            var unpaidDeduction = dailyRate * unpaid;
            var overtimeHours = rows.Sum(a => Math.Max(0, a.GioLamThucTe - (a.LichLamViec?.CaTruc?.SoGioLam ?? 8)));
            var overtimePay = hourlyRate * (decimal)overtimeHours * 1.5m;
            var lateEarlyDeduction = hourlyRate * rows.Sum(a => a.PhutDiMuon + a.PhutVeSom) / 60m;
            var insurance = employee.LuongCoBan * employee.TyLeBaoHiem / 100m;
            line.SetPayrollSnapshot(workedPay, unpaidDeduction, overtimePay, lateEarlyDeduction, insurance);
            if (employee.PhuCapCoDinh > 0) line.AddItem("PHU_CAP", "Phụ cấp cố định", employee.PhuCapCoDinh);
        }
        await repository.UnitOfWork.SaveChangesAsync(ct); return PayrollMapper.Detail(x);
    }
    private async Task<PayrollPeriodDto> Transition(int id, Action<KyLuong> action, CancellationToken ct) { var x=await repository.GetPeriodAsync(id,true,ct) ?? throw new KeyNotFoundException("Không tìm thấy kỳ lương."); action(x); repository.Update(x); await repository.UnitOfWork.SaveChangesAsync(ct); return PayrollMapper.Map(x); }
    public Task<PayrollPeriodDto> Handle(ApprovePayrollCommand c,CancellationToken ct)=>Transition(c.Id,x=>x.Approve(),ct);
    public Task<PayrollPeriodDto> Handle(ClosePayrollCommand c,CancellationToken ct)=>Transition(c.Id,x=>x.Chot(),ct);
    public Task<PayrollPeriodDto> Handle(PayPayrollCommand c,CancellationToken ct)=>Transition(c.Id,x=>x.MarkAsPaid(),ct);
}
