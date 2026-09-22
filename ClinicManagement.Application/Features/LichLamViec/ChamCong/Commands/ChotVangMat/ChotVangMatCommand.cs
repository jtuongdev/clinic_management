using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record ChotVangMatCommand(DateTime? Now = null) : IRequest<int>;
