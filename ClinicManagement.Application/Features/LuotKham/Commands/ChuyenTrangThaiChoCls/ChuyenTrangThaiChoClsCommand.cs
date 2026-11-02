using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChuyenTrangThaiChoCls;

public enum HanhDongChuyenTrangThaiCls
{
    ChuyenChoCls = 1,
    TiepTucKham = 2
}

public sealed record ChuyenTrangThaiChoClsCommand(
    int LuotKhamId,
    HanhDongChuyenTrangThaiCls HanhDong,
    int UserId
) : IRequest<ChuyenTrangThaiChoClsResultDto>;

public sealed record ChuyenTrangThaiChoClsResultDto
{
    public int LuotKhamId { get; init; }
    public string TrangThai { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}
