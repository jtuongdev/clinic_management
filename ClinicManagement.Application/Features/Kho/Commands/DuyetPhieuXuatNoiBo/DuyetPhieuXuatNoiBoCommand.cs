namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record DuyetPhieuXuatNoiBoCommand(int PhieuId, int UserId) : KhoRequest(UserId);
