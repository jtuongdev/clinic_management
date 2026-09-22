using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record TaoDieuChinhChamCongCommand(AttendanceAdjustmentRequest Request, int ActorId) : IRequest<AttendanceAdjustmentDto>;
