using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class DoiTrangThaiMatHangCommandHandler(IKhoService o) : KhoHandler<DoiTrangThaiMatHangCommand>(o)
{ public override Task<InventoryResult> Handle(DoiTrangThaiMatHangCommand r, CancellationToken _) { Set(r); return Ops.ToggleItem(r.Id); } }
