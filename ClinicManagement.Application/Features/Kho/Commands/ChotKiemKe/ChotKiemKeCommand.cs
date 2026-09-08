using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record ChotKiemKeCommand(int Id, StocktakeCountsRequest Data, int UserId) : KhoRequest(UserId);
