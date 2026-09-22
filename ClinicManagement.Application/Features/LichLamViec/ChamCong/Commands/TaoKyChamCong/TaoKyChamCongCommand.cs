using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record TaoKyChamCongCommand(CreateAttendancePeriodRequest Request) : IRequest<AttendancePeriodDto>;
