using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.CapNhatNhaCungCap;

public sealed class CapNhatNhaCungCapCommandHandler(IKhoService o) : KhoHandler<CapNhatNhaCungCapCommand>(o)
{ public override Task<InventoryResult> Handle(CapNhatNhaCungCapCommand r, CancellationToken _) { Set(r); return Ops.UpdateNhaCungCap(r.Id, r.Payload); } }
