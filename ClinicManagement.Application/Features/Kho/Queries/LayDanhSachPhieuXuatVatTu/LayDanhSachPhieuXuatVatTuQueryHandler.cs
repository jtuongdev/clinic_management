using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho.XuatKho;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatVatTu;

public sealed class LayDanhSachPhieuXuatVatTuQueryHandler(IKhoRepository db)
    : IRequestHandler<LayDanhSachPhieuXuatVatTuQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayDanhSachPhieuXuatVatTuQuery r, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, r.PageIndex);
        var pageSize = Math.Clamp(r.PageSize, 1, 100);

        var query = db.PhieuXuatKhos.AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(r.LoaiXuat) && Enum.TryParse<LoaiXuatKho>(r.LoaiXuat, true, out var parsedLoai))
        {
            query = query.Where(x => x.LoaiXuat == parsedLoai);
        }
        else
        {
            query = query.Where(x => x.LoaiXuat == LoaiXuatKho.XUAT_THU_THUAT || x.LoaiXuat == LoaiXuatKho.XUAT_NOI_BO);
        }

        if (r.KhoId.HasValue && r.KhoId.Value > 0)
        {
            query = query.Where(x => x.MaKhoXuat == r.KhoId.Value);
        }

        if (!string.IsNullOrWhiteSpace(r.Keyword))
        {
            var kw = r.Keyword.Trim().ToLower();
            query = query.Where(x =>
                x.MaPhieu.ToLower().Contains(kw) ||
                x.GhiChu.ToLower().Contains(kw) ||
                (x.NguoiXuat != null && x.NguoiXuat.HoTen.ToLower().Contains(kw)) ||
                x.ChiTietXuatKhos.Any(detail =>
                    detail.ChiTietNhapKho.Item.Ten.ToLower().Contains(kw) ||
                    detail.ChiTietNhapKho.Item.Ma.ToLower().Contains(kw)));
        }

        if (r.FromDate.HasValue)
        {
            var from = r.FromDate.Value.Date;
            query = query.Where(x => x.NgayXuat >= from);
        }

        if (r.ToDate.HasValue)
        {
            var exclusiveEnd = r.ToDate.Value.Date.AddDays(1);
            query = query.Where(x => x.NgayXuat < exclusiveEnd);
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(x => x.NgayXuat)
            .ThenByDescending(x => x.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PhieuXuatVatTuDto
            {
                Id = x.Id,
                MaPhieu = x.MaPhieu,
                LoaiXuat = x.LoaiXuat.ToString(),
                MaKhoXuat = x.MaKhoXuat,
                TenKhoXuat = x.KhoXuat != null ? x.KhoXuat.TenKho : string.Empty,
                NgayXuat = x.NgayXuat,
                MaNguoiXuat = x.MaNguoiXuat,
                TenNguoiXuat = x.NguoiXuat != null ? x.NguoiXuat.HoTen : string.Empty,
                GhiChu = x.GhiChu,
                MaDonThuoc = x.MaDonThuoc,
                SoLuongMatHang = x.ChiTietXuatKhos.Count,
                TongSoLuongXuat = x.ChiTietXuatKhos.Sum(c => c.SoLuongXuat),
                TongTienXuat = x.ChiTietXuatKhos.Sum(c => c.SoLuongXuat * c.DonGiaXuat),
                ChiTiets = x.ChiTietXuatKhos.Select(detail => new ChiTietXuatVatTuDto
                {
                    Id = detail.Id,
                    MaItem = detail.ChiTietNhapKho.MaItem,
                    MaItemCode = detail.ChiTietNhapKho.Item.Ma,
                    TenItem = detail.ChiTietNhapKho.Item.Ten,
                    LoaiItem = detail.ChiTietNhapKho.Item.LoaiItem.ToString(),
                    DonViTinh = detail.ChiTietNhapKho.Item.DonViTinhCoBan,
                    SoLo = detail.ChiTietNhapKho.SoLo ?? string.Empty,
                    HanSuDung = detail.ChiTietNhapKho.HanSuDung,
                    SoLuongXuat = detail.SoLuongXuat,
                    DonGiaXuat = detail.DonGiaXuat,
                    ThanhTien = detail.SoLuongXuat * detail.DonGiaXuat
                }).ToList()
            })
            .ToListAsync(ct);

        return InventoryResult.Ok(new { items, total, pageIndex, pageSize });
    }
}
