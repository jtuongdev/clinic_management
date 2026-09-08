using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class GhiNhanKiemKeCommandHandler(IKhoService o) : KhoHandler<GhiNhanKiemKeCommand>(o)
{ public override Task<InventoryResult> Handle(GhiNhanKiemKeCommand r, CancellationToken _) { Set(r); return Ops.CountStocktake(r.Id, r.Data); } }
