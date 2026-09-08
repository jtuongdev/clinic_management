using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayDonDaCapPhatQueryHandler(IKhoService o) : KhoHandler<LayDonDaCapPhatQuery>(o)
{
    public override Task<InventoryResult> Handle(LayDonDaCapPhatQuery r, CancellationToken _)
    {
        Set(r);
        return Ops.DispensedPrescriptions(r.Keyword, r.FromDate, r.ToDate, r.PageIndex, r.PageSize);
    }
}
