using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record DuyetPhieuNhapCommand(int Id, int UserId) : KhoRequest(UserId);
