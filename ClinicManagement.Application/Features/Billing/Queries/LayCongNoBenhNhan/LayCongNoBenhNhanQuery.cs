using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayCongNoBenhNhanQuery(int PatientId) : IRequest<IReadOnlyList<CongNoDto>>;
