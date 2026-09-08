using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class DuyetPhieuNhapCommandHandler(IKhoService o) : KhoHandler<DuyetPhieuNhapCommand>(o)
{ public override Task<InventoryResult> Handle(DuyetPhieuNhapCommand r, CancellationToken _) { Set(r); return Ops.ApproveImport(r.Id); } }
