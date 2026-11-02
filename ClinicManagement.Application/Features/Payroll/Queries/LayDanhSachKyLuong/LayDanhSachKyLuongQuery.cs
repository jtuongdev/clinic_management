using ClinicManagement.Application.DTOs.Payroll;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record GetPayrollPeriodsQuery
    : IRequest<IReadOnlyList<PayrollPeriodDto>>;
