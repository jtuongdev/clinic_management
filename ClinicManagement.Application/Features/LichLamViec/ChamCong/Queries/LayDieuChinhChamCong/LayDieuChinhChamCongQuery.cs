using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record LayDieuChinhChamCongQuery(DateTime? FromDate = null, DateTime? ToDate = null, string? Status = null) : IRequest<IReadOnlyList<AttendanceAdjustmentDto>>;
