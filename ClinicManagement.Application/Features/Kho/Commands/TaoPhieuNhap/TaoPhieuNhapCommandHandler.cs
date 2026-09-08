using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TaoPhieuNhapCommandHandler(IKhoService o) : KhoHandler<TaoPhieuNhapCommand>(o)
{ public override Task<InventoryResult> Handle(TaoPhieuNhapCommand r, CancellationToken _) { Set(r); return Ops.Import(r.Data); } }
