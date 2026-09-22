using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayCongNoQuaHanQuery(int FacilityId) : IRequest<IReadOnlyList<CongNoDto>>;
