using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TaoMatHangCommandHandler(IKhoService o) : KhoHandler<TaoMatHangCommand>(o)
{ public override Task<InventoryResult> Handle(TaoMatHangCommand r, CancellationToken _) { Set(r); return Ops.CreateItem(r.Data); } }
