using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class HuyTonCommandHandler(IKhoService o) : KhoHandler<HuyTonCommand>(o)
{ public override Task<InventoryResult> Handle(HuyTonCommand r, CancellationToken _) { Set(r); return Ops.WriteOff(r.Data); } }
