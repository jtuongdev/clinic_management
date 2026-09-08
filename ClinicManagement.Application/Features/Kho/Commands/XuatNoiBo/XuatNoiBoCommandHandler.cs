using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class XuatNoiBoCommandHandler(IKhoService o) : KhoHandler<XuatNoiBoCommand>(o)
{ public override Task<InventoryResult> Handle(XuatNoiBoCommand r, CancellationToken _) { Set(r); return Ops.InternalUse(r.Data); } }
