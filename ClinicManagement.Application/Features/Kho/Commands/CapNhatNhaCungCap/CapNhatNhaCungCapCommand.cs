using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.CapNhatNhaCungCap;

public sealed record CapNhatNhaCungCapCommand(int Id, NhaCungCapRequest Payload, int UserId) : KhoRequest(UserId);
