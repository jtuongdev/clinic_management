using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record DuyetDieuChinhChamCongCommand(int Id, int ReviewerId, bool Approved, string? Note) : IRequest<AttendanceAdjustmentDto>;
