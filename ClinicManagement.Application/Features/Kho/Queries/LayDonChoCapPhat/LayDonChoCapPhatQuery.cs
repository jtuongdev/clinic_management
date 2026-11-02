using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record LayDonChoCapPhatQuery(int PageIndex, int PageSize, int UserId) : KhoRequest(UserId);
