using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record ApprovePayrollCommand(int Id) : IRequest<PayrollPeriodDto>;
public sealed record ClosePayrollCommand(int Id) : IRequest<PayrollPeriodDto>;
public sealed record PayPayrollCommand(int Id) : IRequest<PayrollPeriodDto>;

public abstract class PayrollTransitionHandler(
    IPayrollRepository repository)
{
    protected async Task<PayrollPeriodDto> Transition(
        int id,
        Action<KyLuong> action,
        CancellationToken cancellationToken)
    {
        var payroll = await repository.GetPeriodAsync(
            id, true, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy kỳ lương.");
        action(payroll);
        repository.Update(payroll);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return PayrollMapper.Map(payroll);
    }
}

public sealed class ApprovePayrollHandler(IPayrollRepository repository)
    : PayrollTransitionHandler(repository),
      IRequestHandler<ApprovePayrollCommand, PayrollPeriodDto>
{
    public Task<PayrollPeriodDto> Handle(
        ApprovePayrollCommand command,
        CancellationToken cancellationToken)
        => Transition(command.Id, payroll => payroll.Approve(), cancellationToken);
}

public sealed class ClosePayrollHandler(IPayrollRepository repository)
    : PayrollTransitionHandler(repository),
      IRequestHandler<ClosePayrollCommand, PayrollPeriodDto>
{
    public Task<PayrollPeriodDto> Handle(
        ClosePayrollCommand command,
        CancellationToken cancellationToken)
        => Transition(command.Id, payroll => payroll.Chot(), cancellationToken);
}

public sealed class PayPayrollHandler(IPayrollRepository repository)
    : PayrollTransitionHandler(repository),
      IRequestHandler<PayPayrollCommand, PayrollPeriodDto>
{
    public Task<PayrollPeriodDto> Handle(
        PayPayrollCommand command,
        CancellationToken cancellationToken)
        => Transition(command.Id, payroll => payroll.MarkAsPaid(), cancellationToken);
}
