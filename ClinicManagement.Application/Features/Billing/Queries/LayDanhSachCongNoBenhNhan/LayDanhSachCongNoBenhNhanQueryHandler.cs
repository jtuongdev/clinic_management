using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayDanhSachCongNoBenhNhanQueryHandler(IHoaDonRepository repository)
    : IRequestHandler<LayDanhSachCongNoBenhNhanQuery, DanhSachCongNoBenhNhanResponseDto>
{
    public async Task<DanhSachCongNoBenhNhanResponseDto> Handle(
        LayDanhSachCongNoBenhNhanQuery request,
        CancellationToken cancellationToken)
    {
        var query = repository.GetCongNoQueryable()
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (request.FacilityId > 0)
        {
            query = query.Where(c => c.HoaDon != null && c.HoaDon.MaCoSo == request.FacilityId);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(c => c.HoaDon != null && c.HoaDon.NgayLap >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(c => c.HoaDon != null && c.HoaDon.NgayLap < request.ToDate.Value.AddDays(1));
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim().ToLower();
            query = query.Where(c =>
                c.MaBenhNhan.ToString().Contains(kw) ||
                (c.BenhNhan != null && ((c.BenhNhan.Ho + " " + c.BenhNhan.Ten).ToLower().Contains(kw) ||
                                         c.BenhNhan.DienThoai.Contains(kw) ||
                                         c.BenhNhan.SoCCCD.Contains(kw))) ||
                (c.HoaDon != null && c.HoaDon.SoHoaDon.ToLower().Contains(kw)));
        }

        var rawList = await query
            .OrderByDescending(c => c.HoaDon != null ? c.HoaDon.NgayLap : c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.MaBenhNhan,
                HoTen = c.BenhNhan != null ? c.BenhNhan.Ho + " " + c.BenhNhan.Ten : string.Empty,
                SoDienThoai = c.BenhNhan != null ? c.BenhNhan.DienThoai : string.Empty,
                SoCCCD = c.BenhNhan != null ? c.BenhNhan.SoCCCD : string.Empty,
                c.MaHoaDon,
                SoHoaDon = c.HoaDon != null ? c.HoaDon.SoHoaDon : string.Empty,
                NgayLap = c.HoaDon != null ? c.HoaDon.NgayLap : c.CreatedAt,
                MaCoSo = c.HoaDon != null ? c.HoaDon.MaCoSo : 0,
                TongTienHoaDon = c.HoaDon != null ? c.HoaDon.TongTien : c.SoTienNo,
                c.SoTienNo,
                c.SoTienDaTra,
                c.HanThanhToan,
                TrangThaiDomain = c.TrangThai
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        var mapped = rawList.Select(x =>
        {
            var remaining = Math.Max(0, x.SoTienNo - x.SoTienDaTra);
            var isOverdue = x.HanThanhToan.HasValue && now.Date > x.HanThanhToan.Value.Date && remaining > 0;
            var isPaidOff = remaining <= 0;

            string statusKey = isPaidOff ? "DA_TAT_TOAN" : (isOverdue ? "QUA_HAN" : "DANG_NO");
            string statusName = isPaidOff ? "Đã tất toán" : (isOverdue ? "Quá hạn" : "Đang nợ");
            int overdueDays = isOverdue && x.HanThanhToan.HasValue ? (int)(now.Date - x.HanThanhToan.Value.Date).TotalDays : 0;

            return new CongNoBenhNhanChiTietDto
            {
                Id = x.Id,
                MaBenhNhan = x.MaBenhNhan,
                TenBenhNhan = x.HoTen,
                SoDienThoai = x.SoDienThoai,
                SoCCCD = x.SoCCCD,
                MaHoaDon = x.MaHoaDon,
                SoHoaDon = x.SoHoaDon,
                NgayLapHoaDon = x.NgayLap,
                MaCoSo = x.MaCoSo,
                TongTienHoaDon = x.TongTienHoaDon,
                SoTienNo = x.SoTienNo,
                SoTienDaTra = x.SoTienDaTra,
                SoTienConLai = remaining,
                HanThanhToan = x.HanThanhToan,
                TrangThai = statusKey,
                TrangThaiTen = statusName,
                SoNgayQuaHan = overdueDays
            };
        }).ToList();

        var summary = new TongQuanCongNoBenhNhanDto
        {
            TongCongNo = mapped.Sum(x => x.SoTienConLai),
            TongNoQuaHan = mapped.Where(x => x.TrangThai == "QUA_HAN").Sum(x => x.SoTienConLai),
            TongDaThanhToan = mapped.Sum(x => x.SoTienDaTra),
            SoKhoanNo = mapped.Count(x => x.TrangThai != "DA_TAT_TOAN"),
            SoKhoanQuaHan = mapped.Count(x => x.TrangThai == "QUA_HAN"),
            SoBenhNhanConNo = mapped.Where(x => x.SoTienConLai > 0).Select(x => x.MaBenhNhan).Distinct().Count(),
            TongSoKhoan = mapped.Count
        };

        if (!string.IsNullOrWhiteSpace(request.Status) && !request.Status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            mapped = mapped.Where(m => m.TrangThai.Equals(request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        var pageIndex = Math.Max(request.PageIndex, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var totalCount = mapped.Count;
        var pagedItems = mapped
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new DanhSachCongNoBenhNhanResponseDto
        {
            DanhSach = new PagedResult<CongNoBenhNhanChiTietDto>
            {
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = pagedItems
            },
            TongQuan = summary
        };
    }
}
