using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record GhiNhanKiemKeCommand(int Id, StocktakeCountRequest Data, int UserId) : KhoRequest(UserId);
