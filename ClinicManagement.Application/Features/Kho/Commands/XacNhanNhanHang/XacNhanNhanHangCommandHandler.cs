using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class XacNhanNhanHangCommandHandler(
    IKhoRepository db)
    : IRequestHandler<XacNhanNhanHangCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(XacNhanNhanHangCommand request, CancellationToken ct)
    {
        var phieu = await db.PhieuXuatKhos.FirstOrDefaultAsync(p => p.Id == request.PhieuId && !p.IsDeleted, ct);
        if (phieu is null) return InventoryResult.Error("Không tìm thấy phiếu xuất.", 404);
        if (phieu.LoaiXuat != LoaiXuatKho.XUAT_NOI_BO_KHOA_PHONG)
            return InventoryResult.Error("Phiếu này không phải loại xuất cấp phát Khoa/Phòng.", 400);

        try { phieu.ConfirmReceived(request.NguoiNhanId, request.GhiChu); }
        catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }

        await db.SaveChangesAsync(ct);
        return InventoryResult.Ok(new { id = phieu.Id, maPhieu = phieu.MaPhieu, trangThai = phieu.TrangThaiXuat!.ToString() });
    }
}
