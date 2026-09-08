using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TraCuuGiaoDichKhoQueryHandler(IKhoService o) : KhoHandler<TraCuuGiaoDichKhoQuery>(o)
{ public override Task<InventoryResult> Handle(TraCuuGiaoDichKhoQuery r, CancellationToken _) { Set(r); return Ops.Audit(r.ItemId, r.FromDate, r.ToDate, r.PageIndex, r.PageSize); } }
