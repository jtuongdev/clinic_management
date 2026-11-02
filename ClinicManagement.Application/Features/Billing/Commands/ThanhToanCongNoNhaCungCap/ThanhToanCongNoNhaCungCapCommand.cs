using ClinicManagement.Application.DTOs.Billing;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record ThanhToanCongNoNhaCungCapCommand(
    ThanhToanCongNoNhaCungCapRequest Request,
    int CurrentUserId) : IRequest<CongNoNhaCungCapDto>;
