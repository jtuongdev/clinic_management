using ClinicManagement.Application.DTOs.Billing;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayTongQuanCongNoNhaCungCapQuery(int FacilityId = 0)
    : IRequest<TongQuanCongNoNhaCungCapDto>;
