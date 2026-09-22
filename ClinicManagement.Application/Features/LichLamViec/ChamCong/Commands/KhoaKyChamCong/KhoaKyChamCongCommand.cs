using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record KhoaKyChamCongCommand(int Id, int UserId, bool Lock) : IRequest<AttendancePeriodDto>;
