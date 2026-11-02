using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Inventory.Services;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class DuyetPhieuXuatNoiBoCommandHandler(
    IKhoRepository db,
    FefoAllocationService fefo)
    : IRequestHandler<DuyetPhieuXuatNoiBoCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(DuyetPhieuXuatNoiBoCommand request, CancellationToken ct)
    {
        var (phieuId, userId) = (request.PhieuId, request.UserId);

        var phieu = await db.PhieuXuatKhos
            .Include(p => p.ChiTietXuatKhos)
            .FirstOrDefaultAsync(p => p.Id == phieuId && !p.IsDeleted, ct);

        if (phieu is null) return InventoryResult.Error("Không tìm thấy phiếu xuất.", 404);
        if (phieu.LoaiXuat != LoaiXuatKho.XUAT_NOI_BO_KHOA_PHONG)
            return InventoryResult.Error("Phiếu này không phải loại xuất cấp phát Khoa/Phòng.", 400);

        try { phieu.Approve(); }
        catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }

        await using var transaction = await db.BeginTransactionAsync(ct);

        var yeuCauGroups = phieu.ChiTietXuatKhos
            .Where(ct2 => ct2.MaItemYeuCau.HasValue)
            .GroupBy(ct2 => ct2.MaItemYeuCau!.Value)
            .Select(g => new { MaItem = g.Key, SoLuongCan = g.Sum(ct2 => ct2.SoLuongXuat) })
            .ToList();

        db.RemoveRange(phieu.ChiTietXuatKhos.ToList());
        phieu.ChiTietXuatKhos.Clear();

        foreach (var yeuCau in yeuCauGroups)
        {
            var batches = await db.TonKhos
                .Include(t => t.ChiTietNhapKho)
                .Where(t => t.MaKho == phieu.MaKhoXuat && t.MaItem == yeuCau.MaItem && t.SoLuongTon > 0
                    && (!t.ChiTietNhapKho.HanSuDung.HasValue || t.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(t => t.ChiTietNhapKho.HanSuDung) // FEFO
                .ToListAsync(ct);

            if (!FefoAllocationService.HasSufficientStock(batches, yeuCau.SoLuongCan))
                return InventoryResult.Error($"Không đủ tồn kho cho mặt hàng #{yeuCau.MaItem}: cần {yeuCau.SoLuongCan}, hiện có {batches.Sum(b => b.SoLuongTon)}.", 409);

            foreach (var allocated in fefo.Allocate(batches, yeuCau.SoLuongCan))
            {
                phieu.ChiTietXuatKhos.Add(new ChiTietXuatKho
                {
                    MaChiTietNhap = allocated.Batch.MaChiTietNhap,
                    MaItemYeuCau = yeuCau.MaItem,
                    SoLuongXuat = allocated.QuantityToTake,
                    DonGiaXuat = 0
                });
                db.Add(new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.XUAT_CAP_PHAT_KHOA_PHONG, MaItem = yeuCau.MaItem,
                    MaTonKho = allocated.Batch.Id, SoLo = allocated.Batch.ChiTietNhapKho.SoLo,
                    SoLuongTruoc = allocated.QuantityBefore, SoLuongThayDoi = -allocated.QuantityToTake,
                    SoLuongSau = allocated.Batch.SoLuongTon, MaChungTu = phieu.MaPhieu, MaNguoiThucHien = userId,
                    GhiChu = $"Cấp phát nội bộ Khoa #{phieu.MaKhoaNhan} theo phiếu {phieu.MaPhieu}"
                });
            }
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(new { id = phieu.Id, maPhieu = phieu.MaPhieu, trangThai = phieu.TrangThaiXuat!.ToString(), tongDong = phieu.ChiTietXuatKhos.Count });
    }
}
