namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record TuChoiPhieuXuatNoiBoCommand(int PhieuId, string LyDo, int UserId) : KhoRequest(UserId);
