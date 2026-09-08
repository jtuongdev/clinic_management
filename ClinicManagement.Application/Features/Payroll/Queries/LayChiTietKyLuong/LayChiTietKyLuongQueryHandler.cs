using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed class GetPayrollPeriodHandler(IPayrollRepository repository)
    : IRequestHandler<GetPayrollPeriodQuery, PayrollDetailDto>
{
    public async Task<PayrollDetailDto> Handle(
        GetPayrollPeriodQuery query,
        CancellationToken cancellationToken)
    {
        var payroll = await repository.GetPeriodAsync(
            query.Id, true, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy kỳ lương.");

        return PayrollMapper.Detail(payroll);
    }
}
