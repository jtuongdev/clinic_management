using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record TaoMatHangCommand(ItemRequest Data, int UserId) : KhoRequest(UserId);
