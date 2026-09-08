using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class HoanThuocBenhNhanCommandHandler(IKhoService o) : KhoHandler<HoanThuocBenhNhanCommand>(o)
{ public override Task<InventoryResult> Handle(HoanThuocBenhNhanCommand r, CancellationToken _) { Set(r); return Ops.ReturnFromPatient(r.Data); } }
