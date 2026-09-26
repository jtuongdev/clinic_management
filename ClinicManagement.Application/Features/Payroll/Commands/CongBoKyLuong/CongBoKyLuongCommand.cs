using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record CongBoKyLuongCommand(int Id) : IRequest<PayrollPeriodDto>;
public sealed record HuyPublishKyLuongCommand(int Id) : IRequest<PayrollPeriodDto>;

public sealed class CongBoKyLuongHandler(IPayrollRepository repository)
    : PayrollTransitionHandler(repository),
      IRequestHandler<CongBoKyLuongCommand, PayrollPeriodDto>
{
    public Task<PayrollPeriodDto> Handle(
        CongBoKyLuongCommand command,
        CancellationToken cancellationToken)
        => Transition(command.Id, payroll => payroll.Publish(), cancellationToken);
}

public sealed class HuyPublishKyLuongHandler(IPayrollRepository repository)
    : PayrollTransitionHandler(repository),
      IRequestHandler<HuyPublishKyLuongCommand, PayrollPeriodDto>
{
    public Task<PayrollPeriodDto> Handle(
        HuyPublishKyLuongCommand command,
        CancellationToken cancellationToken)
        => Transition(command.Id, payroll => payroll.Unpublish(), cancellationToken);
}
