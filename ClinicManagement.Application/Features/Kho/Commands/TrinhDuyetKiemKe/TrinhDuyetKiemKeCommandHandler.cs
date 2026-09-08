using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TrinhDuyetKiemKeCommandHandler(IKhoService o) : KhoHandler<TrinhDuyetKiemKeCommand>(o)
{ public override Task<InventoryResult> Handle(TrinhDuyetKiemKeCommand r, CancellationToken _) { Set(r); return Ops.SubmitStocktake(r.Id); } }
