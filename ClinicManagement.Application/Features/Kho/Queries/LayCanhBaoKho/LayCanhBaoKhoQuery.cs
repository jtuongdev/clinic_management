using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record LayCanhBaoKhoQuery(int ExpiringWithinDays, int UserId) : KhoRequest(UserId);
