using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.TaoPhieuNhapTuPO;

public sealed record TaoPhieuNhapTuPOCommand(CreateImportFromPoRequest Data, int UserId) : KhoRequest(UserId);
