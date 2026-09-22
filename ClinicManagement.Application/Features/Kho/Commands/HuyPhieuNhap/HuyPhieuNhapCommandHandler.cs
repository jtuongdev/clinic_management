using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class HuyPhieuNhapCommandHandler(IKhoService o) : KhoHandler<HuyPhieuNhapCommand>(o)
{
    public override Task<InventoryResult> Handle(HuyPhieuNhapCommand r, CancellationToken _)
    {
        Set(r);
        return Ops.CancelImport(r.Id, r.Reason);
    }
}
