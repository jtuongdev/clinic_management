using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record BanLeCommand(ExportRequest Data, int UserId) : KhoRequest(UserId);
