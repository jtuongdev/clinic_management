using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayDonChoCapPhatQueryHandler(IKhoService o) : KhoHandler<LayDonChoCapPhatQuery>(o)
{ public override Task<InventoryResult> Handle(LayDonChoCapPhatQuery r, CancellationToken _) { Set(r); return Ops.PendingPrescriptions(r.PageIndex, r.PageSize); } }
