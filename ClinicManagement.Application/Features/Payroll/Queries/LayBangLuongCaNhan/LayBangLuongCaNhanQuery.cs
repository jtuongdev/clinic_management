using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record LayBangLuongCaNhanQuery(int EmployeeId) : IRequest<IReadOnlyList<PayrollLineDto>>;

public sealed class LayBangLuongCaNhanQueryHandler(IPayrollRepository repository)
    : IRequestHandler<LayBangLuongCaNhanQuery, IReadOnlyList<PayrollLineDto>>
{
    public async Task<IReadOnlyList<PayrollLineDto>> Handle(
        LayBangLuongCaNhanQuery query,
        CancellationToken cancellationToken)
    {
        var list = await repository.GetEmployeePayslipsAsync(query.EmployeeId, cancellationToken);
        return list.Select(AnhXaBangLuong.MapLine).ToList();
    }
}
