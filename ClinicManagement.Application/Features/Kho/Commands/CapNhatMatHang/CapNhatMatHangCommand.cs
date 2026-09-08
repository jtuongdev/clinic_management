using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record CapNhatMatHangCommand(int Id, ItemRequest Data, int UserId) : KhoRequest(UserId);
