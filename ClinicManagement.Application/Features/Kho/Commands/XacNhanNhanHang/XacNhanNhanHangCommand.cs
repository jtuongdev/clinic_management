namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record XacNhanNhanHangCommand(int PhieuId, int NguoiNhanId, int UserId, string? GhiChu = null) : KhoRequest(UserId);

