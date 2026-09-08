using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class CapNhatMatHangCommandHandler(IKhoService o) : KhoHandler<CapNhatMatHangCommand>(o)
{ public override Task<InventoryResult> Handle(CapNhatMatHangCommand r, CancellationToken _) { Set(r); return Ops.UpdateItem(r.Id, r.Data); } }
