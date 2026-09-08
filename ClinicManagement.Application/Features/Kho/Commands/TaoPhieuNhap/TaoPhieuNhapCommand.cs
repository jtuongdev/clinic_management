using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record TaoPhieuNhapCommand(ImportRequest Data, int UserId) : KhoRequest(UserId);
