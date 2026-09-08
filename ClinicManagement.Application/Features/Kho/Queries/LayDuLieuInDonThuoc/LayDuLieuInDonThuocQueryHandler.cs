using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDuLieuInDonThuoc;

public sealed class LayDuLieuInDonThuocQueryHandler(IKhoService operations)
    : KhoHandler<LayDuLieuInDonThuocQuery>(operations)
{
    public override Task<InventoryResult> Handle(
        LayDuLieuInDonThuocQuery request,
        CancellationToken cancellationToken)
    {
        Set(request);
        return Ops.PrescriptionPrintData(request.PrescriptionId);
    }
}
