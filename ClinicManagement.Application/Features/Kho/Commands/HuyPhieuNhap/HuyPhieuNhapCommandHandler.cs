using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class HuyPhieuNhapCommandHandler(
    IKhoRepository db)
    : IRequestHandler<HuyPhieuNhapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(HuyPhieuNhapCommand request, CancellationToken ct)
    {
        var receipt = await db.PhieuNhapKhos.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (receipt is null) return InventoryResult.Error("Không tìm thấy phiếu nhập.", 404);
        if (receipt.TrangThai == TrangThaiPhieuNhap.DA_HUY) return InventoryResult.Error("Phiếu nhập này đã bị hủy trước đó.", 409);
        if (receipt.TrangThai == TrangThaiPhieuNhap.DA_NHAP) return InventoryResult.Error("Không thể hủy phiếu nhập kho đã hoàn tất nhập hàng.", 409);

        receipt.Cancel();
        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            receipt.GhiChu = string.IsNullOrWhiteSpace(receipt.GhiChu)
                ? $"[Lý do hủy: {request.Reason.Trim()}]"
                : $"{receipt.GhiChu} | [Lý do hủy: {request.Reason.Trim()}]";
        }
        await db.SaveChangesAsync(ct);
        return InventoryResult.Ok(new { id = request.Id, status = receipt.TrangThai.ToString() });
    }
}
