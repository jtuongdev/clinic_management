using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.TaoPhieuNhapTuPO;

public sealed record TaoPhieuNhapTuPOCommand(CreateImportFromPoRequest Data, int UserId) : KhoRequest(UserId);

public sealed class TaoPhieuNhapTuPOCommandHandler(IKhoService ops) : KhoHandler<TaoPhieuNhapTuPOCommand>(ops)
{
    public override Task<InventoryResult> Handle(TaoPhieuNhapTuPOCommand r, CancellationToken _)
    {
        Set(r);
        return Ops.CreateImportFromPo(r.Data);
    }
}
