using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record TraNhaCungCapCommand(StockMutationRequest Data, int UserId) : KhoRequest(UserId);
