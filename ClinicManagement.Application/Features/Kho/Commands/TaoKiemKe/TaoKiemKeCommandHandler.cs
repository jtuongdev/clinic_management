using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TaoKiemKeCommandHandler(IKhoService o) : KhoHandler<TaoKiemKeCommand>(o)
{ public override Task<InventoryResult> Handle(TaoKiemKeCommand r, CancellationToken _) { Set(r); return Ops.CreateStocktake(r.Data); } }
