using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class CapNhatPhieuNhapCommandHandler(IKhoService o) : KhoHandler<CapNhatPhieuNhapCommand>(o)
{
    public override Task<InventoryResult> Handle(CapNhatPhieuNhapCommand r, CancellationToken _)
    {
        Set(r);
        return Ops.UpdateImport(r.Id, r.Data);
    }
}
