namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record HuyPhieuNhapCommand(int Id, string? Reason, int UserId) : KhoRequest(UserId);
