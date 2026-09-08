using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.TaoNhaCungCap;

public sealed class TaoNhaCungCapCommandHandler(IKhoService o) : KhoHandler<TaoNhaCungCapCommand>(o)
{ public override Task<InventoryResult> Handle(TaoNhaCungCapCommand r, CancellationToken _) { Set(r); return Ops.CreateNhaCungCap(r.Payload); } }
