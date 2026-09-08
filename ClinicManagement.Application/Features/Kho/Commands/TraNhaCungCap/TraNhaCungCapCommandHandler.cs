using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TraNhaCungCapCommandHandler(IKhoService o) : KhoHandler<TraNhaCungCapCommand>(o)
{ public override Task<InventoryResult> Handle(TraNhaCungCapCommand r, CancellationToken _) { Set(r); return Ops.ReturnToSupplier(r.Data); } }
