using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayCanhBaoKhoQueryHandler(IKhoService o) : KhoHandler<LayCanhBaoKhoQuery>(o)
{ public override Task<InventoryResult> Handle(LayCanhBaoKhoQuery r, CancellationToken _) { Set(r); return Ops.Alerts(r.ExpiringWithinDays); } }
