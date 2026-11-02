using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Queries.PurchaseOrders;

public sealed record DanhSachDonDatHangChoQuery(int? SupplierId, int UserId) : IRequest<InventoryResult>;

public sealed class DanhSachDonDatHangChoQueryHandler(IKhoRepository db)
    : IRequestHandler<DanhSachDonDatHangChoQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(DanhSachDonDatHangChoQuery r, CancellationToken ct)
    {
        var query = db.DonDatHangs.AsNoTracking()
            .Include(x => x.NhaCungCap)
            .Include(x => x.Kho)
            .Include(x => x.ChiTietDonDatHangs)
            .Where(x => !x.IsDeleted && (x.TrangThai == TrangThaiDonDatHang.DA_DAT || x.TrangThai == TrangThaiDonDatHang.GIAO_MOT_PHAN));

        if (r.SupplierId.HasValue && r.SupplierId.Value > 0)
        {
            query = query.Where(x => x.MaNhaCungCap == r.SupplierId.Value);
        }

        var orders = await query
            .OrderByDescending(x => x.NgayDat)
            .Select(x => new PurchaseOrderPendingDto(
                x.Id,
                x.MaDonDatHang,
                x.MaNhaCungCap,
                x.NhaCungCap.Ma,
                x.NhaCungCap.Ten,
                x.MaKho,
                x.Kho.TenKho,
                x.NgayDat,
                x.NgayDuKienGiao,
                x.TongTien,
                x.TrangThai.ToString(),
                x.ChiTietDonDatHangs.Count,
                x.GhiChu
            ))
            .ToListAsync(ct);

        return InventoryResult.Ok(orders);
    }
}

public sealed record ChiTietDonDatHangChoNhapQuery(int Id, int UserId) : IRequest<InventoryResult>;

public sealed class ChiTietDonDatHangChoNhapQueryHandler(IKhoRepository db)
    : IRequestHandler<ChiTietDonDatHangChoNhapQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(ChiTietDonDatHangChoNhapQuery r, CancellationToken ct)
    {
        var po = await db.DonDatHangs.AsNoTracking()
            .Include(x => x.NhaCungCap)
            .Include(x => x.Kho)
            .Include(x => x.ChiTietDonDatHangs)
                .ThenInclude(ctDetail => ctDetail.Item)
            .FirstOrDefaultAsync(x => x.Id == r.Id && !x.IsDeleted, ct);

        if (po is null)
            return InventoryResult.Error("Không tìm thấy đơn đặt hàng.", 404);

        if (po.TrangThai == TrangThaiDonDatHang.HOAN_THANH || po.TrangThai == TrangThaiDonDatHang.DA_HUY)
            return InventoryResult.Error("Đơn đặt hàng này đã hoàn tất hoặc đã bị hủy.", 409);

        var dateStr = DateTime.UtcNow.ToString("yyMMdd");
        var rand = new Random();

        var lines = po.ChiTietDonDatHangs
            .OrderBy(ctDetail => ctDetail.Id)
            .Select(ctDetail =>
            {
                var remaining = ctDetail.SoLuongConLai;
                var rawCode = !string.IsNullOrWhiteSpace(ctDetail.Item.Ma) ? ctDetail.Item.Ma : "LOT";
                var codePart = new string(rawCode.Where(char.IsLetterOrDigit).ToArray());
                if (codePart.Length > 4) codePart = codePart[..4];
                if (string.IsNullOrEmpty(codePart)) codePart = "LOT";
                var defaultBatch = $"L{dateStr}-{codePart.ToUpper()}{rand.Next(100, 999)}";

                return new PurchaseOrderForImportLineDto(
                    ctDetail.Id,
                    ctDetail.MaItem,
                    ctDetail.Item.Ma,
                    ctDetail.Item.Ten,
                    ctDetail.Item.LoaiItem.ToString(),
                    !string.IsNullOrWhiteSpace(ctDetail.DonViTinh) ? ctDetail.DonViTinh : ctDetail.Item.DonViTinhCoBan,
                    ctDetail.SoLuongDat,
                    ctDetail.SoLuongDaNhap,
                    remaining,
                    ctDetail.DonGiaDat,
                    defaultBatch
                );
            })
            .ToList();

        var result = new PurchaseOrderForImportDto(
            po.Id,
            po.MaDonDatHang,
            po.MaNhaCungCap,
            po.NhaCungCap.Ma,
            po.NhaCungCap.Ten,
            po.MaKho,
            po.Kho.TenKho,
            po.NgayDat,
            po.NgayDuKienGiao,
            po.TongTien,
            po.TrangThai.ToString(),
            po.GhiChu,
            lines
        );

        return InventoryResult.Ok(result);
    }
}
