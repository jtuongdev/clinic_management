using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.TaoNhaCungCap;

public sealed record TaoNhaCungCapCommand(NhaCungCapRequest Payload, int UserId) : KhoRequest(UserId);
