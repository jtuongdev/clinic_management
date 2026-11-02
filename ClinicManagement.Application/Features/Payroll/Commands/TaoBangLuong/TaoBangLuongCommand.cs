using ClinicManagement.Application.DTOs.Payroll;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record GeneratePayrollCommand(int Id)
    : IRequest<PayrollDetailDto>;
