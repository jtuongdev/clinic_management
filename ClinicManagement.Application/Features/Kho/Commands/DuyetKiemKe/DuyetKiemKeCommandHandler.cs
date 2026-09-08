using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class DuyetKiemKeCommandHandler(IKhoService o) : KhoHandler<DuyetKiemKeCommand>(o)
{ public override Task<InventoryResult> Handle(DuyetKiemKeCommand r, CancellationToken _) { Set(r); return Ops.ApproveStocktake(r.Id, r.Data); } }
