using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Queries.DanhSachNhaCungCap;

public sealed class DanhSachNhaCungCapQueryHandler(IKhoService o) : KhoHandler<DanhSachNhaCungCapQuery>(o)
{ 
    public override Task<InventoryResult> Handle(DanhSachNhaCungCapQuery r, CancellationToken _) 
    { 
        Set(r); return Ops.NhaCungCaps(r.Keyword, r.Status, r.PageIndex, r.PageSize); 
    } 
}
