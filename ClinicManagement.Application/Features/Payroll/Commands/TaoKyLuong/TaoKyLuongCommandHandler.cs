using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed class CreatePayrollPeriodHandler(IPayrollRepository repository)
    : IRequestHandler<CreatePayrollPeriodCommand, PayrollPeriodDto>
{
    public async Task<PayrollPeriodDto> Handle(
        CreatePayrollPeriodCommand command,
        CancellationToken cancellationToken)
    {
        var request = command.Request;
        if (await repository.PayrollPeriodExistsAsync(
                request.Thang, request.Nam, cancellationToken))
        {
            throw new InvalidOperationException(
                $"Kỳ lương tháng {request.Thang}/{request.Nam} đã tồn tại.");
        }

        var attendance = await repository.GetAttendancePeriodAsync(
            request.MaKyChamCong, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy kỳ chấm công.");

        if (!attendance.DaKhoa)
            throw new InvalidOperationException(
                "Chỉ kỳ chấm công đã khóa mới được tạo kỳ lương.");

        if (attendance.TuNgay.Date != request.TuNgay.Date ||
            attendance.DenNgay.Date != request.DenNgay.Date)
        {
            throw new InvalidOperationException(
                $"Khoảng tính lương phải trùng kỳ chấm công đã chọn: " +
                $"{attendance.TuNgay:dd/MM/yyyy} - {attendance.DenNgay:dd/MM/yyyy}.");
        }

        var payroll = new KyLuong(
            request.Thang,
            request.Nam,
            request.TuNgay,
            request.DenNgay);
        payroll.LinkAttendancePeriod(request.MaKyChamCong);

        await repository.AddPeriodAsync(payroll, cancellationToken);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return PayrollMapper.Map(payroll);
    }
}
