using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record QuetVaoCommand(int MaNhanVien, DateTime? ThoiGianQuet = null, string? GhiChu = null, int? MaLichLamViec = null) : IRequest<ChamCongDto>;
