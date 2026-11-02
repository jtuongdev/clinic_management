using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record CapPhatDonCommand(int PrescriptionId, DispenseRequest Data, int UserId) : KhoRequest(UserId);
