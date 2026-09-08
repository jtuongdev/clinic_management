using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Commands.DoiTrangThaiNhaCungCap;

public sealed class DoiTrangThaiNhaCungCapCommandHandler(IKhoService o) : KhoHandler<DoiTrangThaiNhaCungCapCommand>(o)
{ public override Task<InventoryResult> Handle(DoiTrangThaiNhaCungCapCommand r, CancellationToken _) { Set(r); return Ops.ToggleNhaCungCap(r.Id); } }
