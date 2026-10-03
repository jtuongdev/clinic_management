using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Queries.DanhSachPhieuNhap;

public sealed class DanhSachPhieuNhapQueryHandler(IKhoRepository db)
    : IRequestHandler<DanhSachPhieuNhapQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(
        DanhSachPhieuNhapQuery request,
        CancellationToken ct)
    {
        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var keyword = request.Keyword?.Trim();

        var query = db.PhieuNhapKhos
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (request.Status.HasValue)
            query = query.Where(x => x.TrangThai == request.Status.Value);

        if (request.FromDate.HasValue)
            query = query.Where(x => x.NgayNhap >= request.FromDate.Value.Date);

        if (request.ToDate.HasValue)
        {
            var exclusiveEnd = request.ToDate.Value.Date.AddDays(1);
            query = query.Where(x => x.NgayNhap < exclusiveEnd);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(x =>
                x.MaPhieu.Contains(keyword) ||
                x.NhaCungCap.Ma.Contains(keyword) ||
                x.NhaCungCap.Ten.Contains(keyword) ||
                x.ChiTietNhapKhos.Any(detail =>
                    detail.Item.Ma.Contains(keyword) ||
                    detail.Item.Ten.Contains(keyword)));
        }

        var total = await query.CountAsync(ct);
        var receipts = await query
            .OrderByDescending(x => x.NgayNhap)
            .ThenByDescending(x => x.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                id = x.Id,
                referenceCode = x.MaPhieu,
                receivedAt = x.NgayNhap,
                totalAmount = x.TongTien,
                status = x.TrangThai.ToString(),
                note = x.GhiChu,
                facility = new
                {
                    id = x.CoSo.Id,
                    code = x.CoSo.Ma,
                    name = x.CoSo.Ten
                },
                warehouse = new
                {
                    id = x.Kho.Id,
                    name = x.Kho.TenKho,
                    address = x.Kho.DiaChi
                },
                supplier = new
                {
                    id = x.NhaCungCap.Id,
                    code = x.NhaCungCap.Ma,
                    name = x.NhaCungCap.Ten,
                    address = x.NhaCungCap.DiaChi,
                    phone = x.NhaCungCap.DienThoai,
                    taxCode = x.NhaCungCap.MaSoThue
                },
                receivedBy = new
                {
                    id = x.NguoiNhap.Id,
                    name = x.NguoiNhap.HoTen
                },
                lines = x.ChiTietNhapKhos
                    .OrderBy(detail => detail.Id)
                    .Select(detail => new
                    {
                        id = detail.Id,
                        itemId = detail.MaItem,
                        itemCode = detail.Item.Ma,
                        itemName = detail.Item.Ten,
                        itemType = detail.Item.LoaiItem.ToString(),
                        baseUnit = detail.Item.DonViTinhCoBan,
                        quantity = detail.SoLuong,
                        purchasePrice = detail.DonGiaNhap,
                        lineAmount = detail.SoLuong * detail.DonGiaNhap,
                        batchNumber = detail.SoLo,
                        expiryDate = detail.HanSuDung,
                        location = detail.ViTri,
                        stockId = detail.TonKho == null ? (int?)null : detail.TonKho.Id,
                        stockQuantity = detail.TonKho == null ? (decimal?)null : detail.TonKho.SoLuongTon
                    })
                    .ToList()
            })
            .ToListAsync(ct);

        return InventoryResult.Ok(new
        {
            receipts,
            total,
            pageIndex,
            pageSize
        });
    }
}
