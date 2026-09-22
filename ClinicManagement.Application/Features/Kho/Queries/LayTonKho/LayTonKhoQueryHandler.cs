using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayTonKhoQueryHandler(IKhoService o) : KhoHandler<LayTonKhoQuery>(o)
{ public override Task<InventoryResult> Handle(LayTonKhoQuery r, CancellationToken _) { Set(r); return Ops.Stock(r.Keyword, r.LowStockOnly, r.PageIndex, r.PageSize, r.KhoId, r.StockStatus); } }
