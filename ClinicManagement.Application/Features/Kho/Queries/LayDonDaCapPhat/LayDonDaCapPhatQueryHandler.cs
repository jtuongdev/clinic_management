using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayDonDaCapPhatQueryHandler(
    IKhoRepository db)
    : IRequestHandler<LayDonDaCapPhatQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayDonDaCapPhatQuery request, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var keyword = request.Keyword?.Trim();

        var query = db.DonThuocs.AsNoTracking().Where(x => x.TrangThai == TrangThaiDonThuoc.DA_XUAT_HET);

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(x => x.LuotKham.BenhNhan.Ho.Contains(keyword) || x.LuotKham.BenhNhan.Ten.Contains(keyword) || x.BacSi.HoTen.Contains(keyword) || (x.NguoiCapThuoc != null && x.NguoiCapThuoc.HoTen.Contains(keyword)));

        if (request.FromDate.HasValue)
            query = query.Where(x => x.NgayCapThuoc.HasValue && x.NgayCapThuoc.Value >= request.FromDate.Value.Date);
        if (request.ToDate.HasValue)
            query = query.Where(x => x.NgayCapThuoc.HasValue && x.NgayCapThuoc.Value < request.ToDate.Value.Date.AddDays(1));

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(x => x.NgayCapThuoc).ThenByDescending(x => x.Id)
            .Skip((pageIndex - 1) * pageSize).Take(pageSize)
            .Select(x => new
            {
                prescriptionId = x.Id,
                prescriptionCode = $"DT-{x.NgayKe.Year}-{x.Id:D5}",
                maLuotKham = x.MaLuotKham,
                patientName = (x.LuotKham.BenhNhan.Ho + " " + x.LuotKham.BenhNhan.Ten).Trim(),
                doctorName = x.BacSi.HoTen,
                dispenserName = x.NguoiCapThuoc != null ? x.NguoiCapThuoc.HoTen : string.Empty,
                ngayKe = x.NgayKe,
                ngayCapThuoc = x.NgayCapThuoc,
                exportReceiptCode = db.PhieuXuatKhos.Where(p => p.MaDonThuoc == x.Id && p.LoaiXuat == LoaiXuatKho.XUAT_DON).OrderByDescending(p => p.Id).Select(p => p.MaPhieu).FirstOrDefault(),
                soLuongDong = x.ChiTietDonThuocs.Count(),
                trangThai = "DA_XUAT_HET"
            }).ToListAsync(ct);

        return InventoryResult.Ok(new { items, total, pageIndex, pageSize });
    }
}
