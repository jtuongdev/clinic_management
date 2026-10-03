using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatNoiBo;

public sealed class LayDanhSachPhieuXuatNoiBoQueryHandler(IKhoRepository db)
    : IRequestHandler<LayDanhSachPhieuXuatNoiBoQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayDanhSachPhieuXuatNoiBoQuery r, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, r.PageIndex);
        var pageSize = Math.Clamp(r.PageSize, 1, 100);

        var query = db.PhieuXuatKhos.AsNoTracking()
            .Where(p => !p.IsDeleted && p.LoaiXuat == LoaiXuatKho.XUAT_NOI_BO_KHOA_PHONG);

        if (r.MaKhoa.HasValue && r.MaKhoa.Value > 0)
            query = query.Where(p => p.MaKhoaNhan == r.MaKhoa.Value);

        if (!string.IsNullOrWhiteSpace(r.TrangThai)
            && Enum.TryParse<TrangThaiXuatNoiBo>(r.TrangThai, true, out var parsedTrangThai))
            query = query.Where(p => p.TrangThaiXuat == parsedTrangThai);

        if (r.TuNgay.HasValue)
            query = query.Where(p => p.NgayXuat >= r.TuNgay.Value.Date);

        if (r.DenNgay.HasValue)
            query = query.Where(p => p.NgayXuat < r.DenNgay.Value.Date.AddDays(1));

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(p => p.NgayXuat)
            .ThenByDescending(p => p.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                id = p.Id,
                maPhieu = p.MaPhieu,
                ngayLap = p.NgayXuat,
                trangThaiXuat = p.TrangThaiXuat != null ? p.TrangThaiXuat.ToString() : null,
                maKhoaNhan = p.MaKhoaNhan,
                tenKhoaNhan = p.KhoaNhan != null ? p.KhoaNhan.Ten : null,
                maKhoaCode = p.KhoaNhan != null ? p.KhoaNhan.Ma : null,
                nguoiNhanId = p.NguoiNhanId,
                tenNguoiNhan = p.NguoiNhan != null ? p.NguoiNhan.HoTen : null,
                nguoiLap = p.NguoiXuat != null ? p.NguoiXuat.HoTen : null,
                tongMatHang = p.ChiTietXuatKhos.Select(detail => detail.MaItemYeuCau).Distinct().Count(),
                tongSoLuong = p.ChiTietXuatKhos.Sum(detail => detail.SoLuongXuat),
                ghiChu = p.GhiChu,
                chiTiets = p.ChiTietXuatKhos.Select(detail => new
                {
                    id = detail.Id,
                    maItem = detail.MaItemYeuCau,
                    soLuong = detail.SoLuongXuat,
                    donGia = detail.DonGiaXuat
                }).ToList()
            })
            .ToListAsync(ct);

        return InventoryResult.Ok(new { items, total, pageIndex, pageSize });
    }
}

public sealed class LayThongKeTieuHaoTheoKhoaQueryHandler(IKhoRepository db)
    : IRequestHandler<LayThongKeTieuHaoTheoKhoaQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayThongKeTieuHaoTheoKhoaQuery r, CancellationToken ct)
    {
        var denNgayExclusive = r.DenNgay.Date.AddDays(1);

        // 1. Tổng vật tư đã cấp phát (DaDuyet hoặc DaNhanHang)
        var vatTuQuery = db.PhieuXuatKhos.AsNoTracking()
            .Where(p => !p.IsDeleted
                && p.LoaiXuat == LoaiXuatKho.XUAT_NOI_BO_KHOA_PHONG
                && (p.TrangThaiXuat == TrangThaiXuatNoiBo.DaDuyet
                    || p.TrangThaiXuat == TrangThaiXuatNoiBo.DaNhanHang)
                && p.NgayXuat >= r.TuNgay.Date
                && p.NgayXuat < denNgayExclusive
                && p.MaKhoaNhan.HasValue);

        if (r.MaKhoa.HasValue && r.MaKhoa.Value > 0)
            vatTuQuery = vatTuQuery.Where(p => p.MaKhoaNhan == r.MaKhoa.Value);

        var vatTuStats = await vatTuQuery
            .GroupBy(p => new { p.MaKhoaNhan, p.KhoaNhan!.Ten, p.KhoaNhan.Ma })
            .Select(g => new
            {
                maKhoa = g.Key.MaKhoaNhan,
                tenKhoa = g.Key.Ten,
                maKhoaCode = g.Key.Ma,
                tongPhieu = g.Count(),
                tongSoLuong = g.SelectMany(p => p.ChiTietXuatKhos).Sum(detail => detail.SoLuongXuat),
                tongMatHang = g.SelectMany(p => p.ChiTietXuatKhos)
                               .Select(detail => detail.MaItemYeuCau).Distinct().Count()
            })
            .ToListAsync(ct);

        // 2. Số lượt khám hoàn thành theo Khoa trong kỳ
        var luotKhamQuery = db.LuotKhams.AsNoTracking()
            .Where(lk => !lk.IsDeleted
                && lk.TrangThai == TrangThaiLuotKham.HOAN_THANH
                && lk.NgayKham >= r.TuNgay.Date
                && lk.NgayKham < denNgayExclusive);

        if (r.MaKhoa.HasValue && r.MaKhoa.Value > 0)
            luotKhamQuery = luotKhamQuery.Where(lk => lk.MaKhoa == r.MaKhoa.Value);

        var luotKhamStats = await luotKhamQuery
            .GroupBy(lk => lk.MaKhoa)
            .Select(g => new { maKhoa = g.Key, tongLuotKham = g.Count() })
            .ToListAsync(ct);

        // 3. Số chỉ định dịch vụ hoàn thành theo Khoa trong kỳ
        var chiDinhQuery = db.ChiDinhDichVus.AsNoTracking()
            .Where(cd => !cd.IsDeleted
                && cd.TrangThai == TrangThaiChiDinhDichVu.DaCoKetQua
                && cd.NgayCoKetQua.HasValue
                && cd.NgayCoKetQua.Value >= r.TuNgay.Date
                && cd.NgayCoKetQua.Value < denNgayExclusive);

        if (r.MaKhoa.HasValue && r.MaKhoa.Value > 0)
            chiDinhQuery = chiDinhQuery.Where(cd => cd.LuotKham!.MaKhoa == r.MaKhoa.Value);

        var chiDinhStats = await chiDinhQuery
            .GroupBy(cd => cd.LuotKham!.MaKhoa)
            .Select(g => new { maKhoa = (int?)g.Key, tongChiDinh = g.Count() })
            .ToListAsync(ct);

        // 4. Kết hợp
        var result = vatTuStats.Select(v =>
        {
            var lk = luotKhamStats.FirstOrDefault(x => x.maKhoa == v.maKhoa);
            var cd = chiDinhStats.FirstOrDefault(x => x.maKhoa == v.maKhoa);
            return new
            {
                v.maKhoa,
                v.tenKhoa,
                v.maKhoaCode,
                v.tongPhieu,
                v.tongSoLuong,
                v.tongMatHang,
                tongLuotKham = lk?.tongLuotKham ?? 0,
                tongChiDinh = cd?.tongChiDinh ?? 0
            };
        }).ToList();

        return InventoryResult.Ok(new { items = result, tuNgay = r.TuNgay, denNgay = r.DenNgay });
    }
}
