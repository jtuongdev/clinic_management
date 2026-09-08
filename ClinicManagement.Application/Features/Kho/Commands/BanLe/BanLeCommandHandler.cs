using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class BanLeCommandHandler(IKhoService o) : KhoHandler<BanLeCommand>(o)
{ public override Task<InventoryResult> Handle(BanLeCommand r, CancellationToken _) { Set(r); return Ops.Retail(r.Data); } }
