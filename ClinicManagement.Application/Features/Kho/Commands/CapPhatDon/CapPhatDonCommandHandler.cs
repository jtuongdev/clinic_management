using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class CapPhatDonCommandHandler(IKhoService o) : KhoHandler<CapPhatDonCommand>(o)
{ public override Task<InventoryResult> Handle(CapPhatDonCommand r, CancellationToken _) { Set(r); return Ops.Dispense(r.PrescriptionId, r.Data); } }
