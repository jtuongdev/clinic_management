using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record TaoKiemKeCommand(StocktakeCreateRequest Data, int UserId) : KhoRequest(UserId);
