using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TaoYeuCauXuatNoiBoCommandHandler(
    IKhoRepository db,
    IdempotencyHelper idempotency)
    : IRequestHandler<TaoYeuCauXuatNoiBoCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TaoYeuCauXuatNoiBoCommand request, CancellationToken ct)
    {
        var (r, userId) = (request.Data, request.UserId);
        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, nameof(TaoYeuCauXuatNoiBoCommand));
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        var items = r.Items?.ToList();
        if (items is null || items.Count == 0)
            return InventoryResult.Error("Yêu cầu phải có ít nhất một dòng vật tư.");

        var khoaNhan = await db.Khoas.AsNoTracking().FirstOrDefaultAsync(x => x.Id == r.MaKhoaNhan, ct);
        if (khoaNhan is null) return InventoryResult.Error($"Không tìm thấy Khoa/Phòng #{r.MaKhoaNhan}.", 404);

        var khoXuat = await db.Khos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == r.MaKhoXuat, ct);
        if (khoXuat is null) return InventoryResult.Error($"Không tìm thấy kho xuất #{r.MaKhoXuat}.", 404);
        if (khoXuat.TrangThai != TrangThaiKho.HoatDong) return InventoryResult.Error("Kho xuất đang ngừng hoạt động.", 409);

        await using var transaction = await db.BeginTransactionAsync(ct);
        var phieu = new PhieuXuatKho
        {
            MaPhieu = $"YC-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            LoaiXuat = LoaiXuatKho.XUAT_NOI_BO_KHOA_PHONG,
            MaKhoXuat = r.MaKhoXuat,
            MaKhoaNhan = r.MaKhoaNhan,
            NguoiNhanId = r.NguoiNhanId,
            MaNguoiXuat = userId,
            GhiChu = r.GhiChu ?? string.Empty,
            TrangThaiXuat = TrangThaiXuatNoiBo.ChoDuyet,
            NgayXuat = DateTime.UtcNow
        };

        foreach (var line in items)
        {
            var item = await db.Items.AsNoTracking().FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive, ct);
            if (item is null) return InventoryResult.Error($"Mặt hàng #{line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);
            if (item.LoaiItem != LoaiItem.VA_TU) return InventoryResult.Error($"Mặt hàng '{item.Ten}' không phải là vật tư y tế. Phiếu cấp phát nội bộ chỉ áp dụng cho vật tư.");

            var baseQty = await ToBaseQuantity(db, item, line.SoLuong, line.DonViTinh, ct);
            if (baseQty <= 0) return InventoryResult.Error($"Số lượng hoặc đơn vị của mặt hàng '{item.Ten}' không hợp lệ.");

            var tongTon = await db.TonKhos
                .Where(t => t.MaKho == r.MaKhoXuat && t.MaItem == line.ItemId && t.SoLuongTon > 0)
                .SumAsync(t => t.SoLuongTon, ct);

            var ghiChuDong = string.IsNullOrWhiteSpace(line.GhiChu) ? string.Empty : line.GhiChu;
            if (tongTon < baseQty)
                ghiChuDong = $"{ghiChuDong}[⚠ Tồn kho có thể không đủ: cần {baseQty}, hiện có {tongTon}]".TrimStart();

            var sampleNhapId = await db.TonKhos
                .Where(t => t.MaItem == line.ItemId)
                .Select(t => (int?)t.MaChiTietNhap)
                .FirstOrDefaultAsync(ct)
                ?? await db.TonKhos.Select(t => (int?)t.MaChiTietNhap).FirstOrDefaultAsync(ct)
                ?? 1;

            phieu.ChiTietXuatKhos.Add(new ChiTietXuatKho
            {
                MaChiTietNhap = sampleNhapId,
                MaItemYeuCau = line.ItemId,
                SoLuongXuat = baseQty,
                DonGiaXuat = 0
            });
        }

        db.Add(phieu);
        await db.SaveChangesAsync(ct);
        var result = new { id = phieu.Id, maPhieu = phieu.MaPhieu, trangThai = phieu.TrangThaiXuat!.ToString() };
        await idempotency.SaveAsync(r.IdempotencyKey, nameof(TaoYeuCauXuatNoiBoCommand), result, userId);
        await transaction.CommitAsync(ct);
        return InventoryResult.Ok(result);
    }

    private static async Task<decimal> ToBaseQuantity(IKhoRepository db, Item item, decimal quantity, string? unit, CancellationToken ct)
    {
        if (quantity <= 0) return 0;
        if (string.IsNullOrWhiteSpace(unit) || unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)) return quantity;
        var conversion = await db.DonViTinhQuyDois.FirstOrDefaultAsync(x => x.MaItem == item.Id && x.DonVi == unit, ct);
        return conversion is null ? 0 : quantity * conversion.HeSo;
    }
}
