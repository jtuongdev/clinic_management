using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record LayDanhSachKyChamCongQuery : IRequest<IReadOnlyList<AttendancePeriodDto>>;
