using ClinicManagement.Application.DTOs.Payroll;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record CreatePayrollPeriodCommand(CreatePayrollPeriodRequest Request)
    : IRequest<PayrollPeriodDto>;
