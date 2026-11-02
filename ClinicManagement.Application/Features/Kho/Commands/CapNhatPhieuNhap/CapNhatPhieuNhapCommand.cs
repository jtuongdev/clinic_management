using ClinicManagement.Application.DTOs.Kho;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record CapNhatPhieuNhapCommand(int Id, ImportRequest Data, int UserId) : KhoRequest(UserId);
