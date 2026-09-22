using ClinicManagement.Application.Common.Interfaces;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record XemTruocPhanBoFefoQuery(int PrescriptionId, int UserId) : KhoRequest(UserId);

public sealed class XemTruocPhanBoFefoQueryHandler(IKhoService o) : KhoHandler<XemTruocPhanBoFefoQuery>(o)
{
    public override Task<InventoryResult> Handle(XemTruocPhanBoFefoQuery r, CancellationToken _)
    {
        Set(r);
        return Ops.PreviewFefo(r.PrescriptionId);
    }
}
