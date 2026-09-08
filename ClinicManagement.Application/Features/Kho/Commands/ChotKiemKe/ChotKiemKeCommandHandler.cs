using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class ChotKiemKeCommandHandler(IKhoService o) : KhoHandler<ChotKiemKeCommand>(o)
{ public override Task<InventoryResult> Handle(ChotKiemKeCommand r, CancellationToken _) { Set(r); return Ops.FinalizeStocktake(r.Id, r.Data); } }
