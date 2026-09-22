using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed class GetPayrollPeriodsHandler(IPayrollRepository repository)
    : IRequestHandler<GetPayrollPeriodsQuery, IReadOnlyList<PayrollPeriodDto>>
{
    public async Task<IReadOnlyList<PayrollPeriodDto>> Handle(
        GetPayrollPeriodsQuery query,
        CancellationToken cancellationToken)
    {
        return (await repository.GetPeriodsAsync(cancellationToken))
            .Select(AnhXaBangLuong.Map)
            .ToList();
    }
}
