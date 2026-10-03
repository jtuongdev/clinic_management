using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayDanhSachCongNoNhaCungCapQueryHandler(IKhoRepository repository)
    : IRequestHandler<LayDanhSachCongNoNhaCungCapQuery, DanhSachCongNoNhaCungCapResponseDto>
{
    public async Task<DanhSachCongNoNhaCungCapResponseDto> Handle(
        LayDanhSachCongNoNhaCungCapQuery request,
        CancellationToken cancellationToken)
    {
        var query = repository.PhieuNhapKhos
            .AsNoTracking()
            .Include(p => p.NhaCungCap)
            .Where(p => !p.IsDeleted && p.TrangThai == TrangThaiPhieuNhap.DA_NHAP);

        if (request.FacilityId > 0)
        {
            query = query.Where(p => p.MaCoSo == request.FacilityId);
        }

        if (request.SupplierId.HasValue && request.SupplierId.Value > 0)
        {
            query = query.Where(p => p.MaNhaCungCap == request.SupplierId.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(p => p.NgayNhap >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(p => p.NgayNhap < request.ToDate.Value.AddDays(1));
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim().ToLower();
            query = query.Where(p =>
                p.MaPhieu.ToLower().Contains(kw) ||
                p.NhaCungCap.Ten.ToLower().Contains(kw) ||
                p.NhaCungCap.Ma.ToLower().Contains(kw) ||
                (p.NhaCungCap.DienThoai != null && p.NhaCungCap.DienThoai.Contains(kw)));
        }

        var rawList = await query
            .OrderByDescending(p => p.NgayNhap)
            .Select(p => new
            {
                p.Id,
                p.MaPhieu,
                p.MaNhaCungCap,
                MaNcc = p.NhaCungCap.Ma,
                TenNhaCungCap = p.NhaCungCap.Ten,
                SoDienThoai = p.NhaCungCap.DienThoai,
                Email = p.NhaCungCap.Email,
                DiaChi = p.NhaCungCap.DiaChi,
                p.MaCoSo,
                p.MaKho,
                p.NgayNhap,
                p.TongTien,
                p.GhiChu
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        var mapped = rawList.Select(x =>
        {
            var paid = SupplierPaymentHelper.ParsePaidAmount(x.GhiChu);
            var remaining = Math.Max(0, x.TongTien - paid);
            var dueDate = x.NgayNhap.AddDays(30);
            var isOverdue = now.Date > dueDate.Date && remaining > 0;
            var isPaidOff = remaining <= 0;

            string statusKey = isPaidOff ? "DA_TAT_TOAN" : (isOverdue ? "QUA_HAN" : "DANG_NO");
            string statusName = isPaidOff ? "Đã tất toán" : (isOverdue ? "Quá hạn" : "Đang nợ");
            int overdueDays = isOverdue ? (int)(now.Date - dueDate.Date).TotalDays : 0;

            return new CongNoNhaCungCapDto
            {
                Id = x.Id,
                MaPhieuNhap = x.MaPhieu,
                MaNhaCungCap = x.MaNhaCungCap,
                MaNcc = x.MaNcc,
                TenNhaCungCap = x.TenNhaCungCap,
                SoDienThoai = x.SoDienThoai,
                Email = x.Email,
                DiaChi = x.DiaChi,
                MaCoSo = x.MaCoSo,
                MaKho = x.MaKho,
                NgayNhap = x.NgayNhap,
                HanThanhToan = dueDate,
                TongTien = x.TongTien,
                SoTienDaTra = paid,
                SoTienConLai = remaining,
                TrangThai = statusKey,
                TrangThaiTen = statusName,
                SoNgayQuaHan = overdueDays,
                GhiChu = SupplierPaymentHelper.CleanGhiChu(x.GhiChu),
                LichSuThanhToan = SupplierPaymentHelper.ParsePaymentHistory(x.GhiChu)
            };
        }).ToList();

        // Calculate summary across all items before status filter
        var summary = new TongQuanCongNoNhaCungCapDto
        {
            TongCongNo = mapped.Sum(x => x.SoTienConLai),
            TongNoQuaHan = mapped.Where(x => x.TrangThai == "QUA_HAN").Sum(x => x.SoTienConLai),
            TongDaThanhToan = mapped.Sum(x => x.SoTienDaTra),
            SoPhieuChuaThanhToan = mapped.Count(x => x.TrangThai != "DA_TAT_TOAN"),
            SoPhieuQuaHan = mapped.Count(x => x.TrangThai == "QUA_HAN"),
            SoNhaCungCapConNo = mapped.Where(x => x.SoTienConLai > 0).Select(x => x.MaNhaCungCap).Distinct().Count(),
            TongSoPhieu = mapped.Count
        };

        // Filter by status if specified
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

        return new DanhSachCongNoNhaCungCapResponseDto
        {
            DanhSach = new PagedResult<CongNoNhaCungCapDto>
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
