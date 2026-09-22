using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Queries.PurchaseOrders;

public sealed record DanhSachDonDatHangChoQuery(int? SupplierId, int UserId) : KhoRequest(UserId);

public sealed class DanhSachDonDatHangChoQueryHandler(IKhoService ops) : KhoHandler<DanhSachDonDatHangChoQuery>(ops)
{
    public override Task<InventoryResult> Handle(DanhSachDonDatHangChoQuery r, CancellationToken _)
    {
        Set(r);
        return Ops.GetPendingPurchaseOrders(r.SupplierId);
    }
}

public sealed record ChiTietDonDatHangChoNhapQuery(int Id, int UserId) : KhoRequest(UserId);

public sealed class ChiTietDonDatHangChoNhapQueryHandler(IKhoService ops) : KhoHandler<ChiTietDonDatHangChoNhapQuery>(ops)
{
    public override Task<InventoryResult> Handle(ChiTietDonDatHangChoNhapQuery r, CancellationToken _)
    {
        Set(r);
        return Ops.GetPurchaseOrderForImport(r.Id);
    }
}
