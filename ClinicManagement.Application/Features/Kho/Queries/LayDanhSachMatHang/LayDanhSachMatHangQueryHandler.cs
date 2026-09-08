using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayDanhSachMatHangQueryHandler(IKhoService o) : KhoHandler<LayDanhSachMatHangQuery>(o)
{ public override Task<InventoryResult> Handle(LayDanhSachMatHangQuery r, CancellationToken _) { Set(r); return Ops.Items(r.Keyword, r.ItemType, r.IsActive, r.PageIndex, r.PageSize); } }
