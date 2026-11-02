using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record QuetRaCommand(int MaNhanVien, DateTime? ThoiGianQuet = null, string? GhiChu = null) : IRequest<ChamCongDto>;
