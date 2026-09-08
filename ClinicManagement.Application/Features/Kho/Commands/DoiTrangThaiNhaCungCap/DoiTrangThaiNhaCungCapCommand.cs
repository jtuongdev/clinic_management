using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.DoiTrangThaiNhaCungCap;

public sealed record DoiTrangThaiNhaCungCapCommand(int Id, int UserId) : KhoRequest(UserId);
