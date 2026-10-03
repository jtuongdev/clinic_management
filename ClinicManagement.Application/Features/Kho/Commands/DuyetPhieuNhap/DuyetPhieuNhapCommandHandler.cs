using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class DuyetPhieuNhapCommandHandler(
    IKhoRepository db)
    : IRequestHandler<DuyetPhieuNhapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(DuyetPhieuNhapCommand request, CancellationToken ct)
    {
        var receipt = await db.PhieuNhapKhos.Include(x => x.ChiTietNhapKhos).FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (receipt is null) return InventoryResult.Error("Không tìm thấy phiếu nhập.", 404);
        if (receipt.TrangThai != TrangThaiPhieuNhap.CHO_DUYET) return InventoryResult.Error("Phiếu nhập không ở trạng thái chờ duyệt.", 409);

        await using var transaction = await db.BeginTransactionAsync(ct);
        receipt.Approve();
        foreach (var detail in receipt.ChiTietNhapKhos)
        {
            var stock = new TonKho
            {
                MaKho = receipt.MaKho, MaItem = detail.MaItem, MaChiTietNhap = detail.Id,
                SoLuongTon = detail.SoLuong, NgayCapNhatCuoi = DateTime.UtcNow
            };
            db.Add(stock);
            db.Add(new InventoryTransaction
            {
                LoaiGiaoDich = LoaiGiaoDichKho.NHAP, MaItem = detail.MaItem,
                TonKho = stock, // Navigation Property fixes Foreign Key constraint!
                SoLo = detail.SoLo, SoLuongThayDoi = detail.SoLuong, SoLuongSau = detail.SoLuong,
                MaChungTu = receipt.MaPhieu, MaNguoiThucHien = request.UserId
            });
        }
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(new { id = request.Id, status = receipt.TrangThai.ToString() });
    }
}
