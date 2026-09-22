using System;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.HoanThanhVaKhoaKham;

public sealed record HoanThanhVaKhoaKhamCommand(
    int LuotKhamId,
    int UserId,
    string? LyDo = null,
    string? ChuKySo = null
) : IRequest<HoanThanhVaKhoaKhamResultDto>;

public sealed record HoanThanhVaKhoaKhamResultDto
{
    public int LuotKhamId { get; init; }
    public string TrangThai { get; init; } = string.Empty;
    public bool EmrLocked { get; init; }
    public string ChuKySo { get; init; } = string.Empty;
    public DateTime? EmrLockedAt { get; init; }
    public int? HoaDonId { get; init; }
    public string SoHoaDon { get; init; } = string.Empty;
    public decimal TongTien { get; init; }
    public string Message { get; init; } = string.Empty;
}
