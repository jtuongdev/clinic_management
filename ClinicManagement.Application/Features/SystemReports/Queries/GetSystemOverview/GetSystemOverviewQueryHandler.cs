using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.SystemReports;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemOverview;

public sealed class GetSystemOverviewQueryHandler(
    ILuotKhamRepository luotKhamRepo,
    IHoaDonRepository hoaDonRepo,
    IKhoRepository khoRepo,
    INhanVienRepository nhanVienRepo)
    : IRequestHandler<GetSystemOverviewQuery, SystemReportsOverviewDto>
{
    public async Task<SystemReportsOverviewDto> Handle(
        GetSystemOverviewQuery request,
        CancellationToken cancellationToken)
    {
        var from = (request.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var to = (request.ToDate ?? DateTime.UtcNow).Date.AddDays(1);

        // 1. Lượt khám
        var visitQuery = luotKhamRepo.GetQueryable().AsNoTracking()
            .Where(v => v.NgayKham >= from && v.NgayKham < to);

        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
            visitQuery = visitQuery.Where(v => v.MaCoSo == request.FacilityId.Value);
        if (request.DepartmentId.HasValue && request.DepartmentId.Value > 0)
            visitQuery = visitQuery.Where(v => v.MaKhoa == request.DepartmentId.Value);

        var totalVisits = await visitQuery.CountAsync(cancellationToken);
        var completedVisits = await visitQuery.CountAsync(v => v.TrangThai == TrangThaiLuotKham.HOAN_THANH, cancellationToken);
        var pendingVisits = await visitQuery.CountAsync(v => v.TrangThai == TrangThaiLuotKham.CHO_KHAM || v.TrangThai == TrangThaiLuotKham.DANG_KHAM, cancellationToken);
        var canceledVisits = await visitQuery.CountAsync(v => v.TrangThai == TrangThaiLuotKham.DA_HUY, cancellationToken);

        // 2. Hóa đơn & Tài chính
        var invoiceQuery = hoaDonRepo.GetQueryable().AsNoTracking()
            .Where(h => !h.IsDeleted && h.TrangThai != TrangThaiHoaDon.DA_HUY && h.NgayLap >= from && h.NgayLap < to);

        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
            invoiceQuery = invoiceQuery.Where(h => h.MaCoSo == request.FacilityId.Value);

        var totalRevenue = await invoiceQuery.SumAsync(h => (decimal?)h.TongTien, cancellationToken) ?? 0;
        var collectedRevenue = await invoiceQuery.SumAsync(h => (decimal?)h.DaThanhToan, cancellationToken) ?? 0;
        var insurancePaid = await invoiceQuery.SumAsync(h => (decimal?)h.SoTienBaoHiemChiTra, cancellationToken) ?? 0;
        var pendingDebt = await invoiceQuery.SumAsync(h => (decimal?)(h.SoTienBenhNhanChiTra - h.DaThanhToan), cancellationToken) ?? 0;

        // 3. Kho Dược
        var totalMedicines = await khoRepo.Items.AsNoTracking().CountAsync(cancellationToken);
        var lowStockMedicines = await khoRepo.TonKhos.AsNoTracking()
            .Include(t => t.Item)
            .Where(t => t.Item.TonToiThieu > 0 && t.SoLuongTon <= t.Item.TonToiThieu)
            .Select(t => t.MaItem)
            .Distinct()
            .CountAsync(cancellationToken);

        var thresholdDate = DateTime.UtcNow.AddDays(90);
        var expiringBatches = await khoRepo.TonKhos.AsNoTracking()
            .Include(t => t.ChiTietNhapKho)
            .Where(t => t.ChiTietNhapKho.HanSuDung.HasValue && t.ChiTietNhapKho.HanSuDung.Value <= thresholdDate && t.SoLuongTon > 0)
            .CountAsync(cancellationToken);

        var inventoryValue = await khoRepo.TonKhos.AsNoTracking()
            .Include(t => t.ChiTietNhapKho)
            .SumAsync(t => (decimal?)(t.SoLuongTon * t.ChiTietNhapKho.DonGiaNhap), cancellationToken) ?? 0;

        // 4. Nhân sự
        var staffQuery = nhanVienRepo.GetQueryable().AsNoTracking();
        var staffCount = await staffQuery.CountAsync(x => x.IsActive, cancellationToken);
        var doctorsCount = await staffQuery.CountAsync(x => x.IsActive && (!string.IsNullOrEmpty(x.ChuyenKhoa) || !string.IsNullOrEmpty(x.SoHanhNghe)), cancellationToken);

        // 5. Biểu đồ xu hướng ngày (Doanh thu & Lượt khám)
        var dailyVisits = await visitQuery
            .GroupBy(v => v.NgayKham.Date)
            .Select(g => new { Date = g.Key, Visits = g.Count(), Completed = g.Count(x => x.TrangThai == TrangThaiLuotKham.HOAN_THANH) })
            .ToListAsync(cancellationToken);

        var dailyInvoices = await invoiceQuery
            .GroupBy(h => h.NgayLap.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(x => x.TongTien) })
            .ToListAsync(cancellationToken);

        var totalDays = Math.Min(31, Math.Max(1, (int)(to - from).TotalDays));
        var dateRange = Enumerable.Range(0, totalDays)
            .Select(offset => from.AddDays(offset))
            .ToList();

        var trends = dateRange.Select(d =>
        {
            var v = dailyVisits.FirstOrDefault(x => x.Date == d);
            var r = dailyInvoices.FirstOrDefault(x => x.Date == d);
            return new SystemReportsTrendDto
            {
                Date = d.ToString("dd/MM"),
                Visits = v?.Visits ?? 0,
                Completed = v?.Completed ?? 0,
                Revenue = r?.Revenue ?? 0m
            };
        }).ToList();

        // 6. Doanh thu theo Khoa
        var deptRevenue = await hoaDonRepo.GetQueryable().AsNoTracking()
            .Include(h => h.LuotKham)
                .ThenInclude(l => l!.Khoa)
            .Where(h => !h.IsDeleted && h.TrangThai != TrangThaiHoaDon.DA_HUY && h.NgayLap >= from && h.NgayLap < to && h.LuotKham != null && h.LuotKham.Khoa != null)
            .GroupBy(h => h.LuotKham!.Khoa.Ten)
            .Select(g => new SystemReportsDepartmentRevenueDto
            {
                Name = g.Key,
                Value = g.Sum(x => x.TongTien)
            })
            .OrderByDescending(x => x.Value)
            .Take(6)
            .ToListAsync(cancellationToken);

        return new SystemReportsOverviewDto
        {
            Kpis = new SystemReportsOverviewKpisDto
            {
                TotalVisits = totalVisits,
                CompletedVisits = completedVisits,
                PendingVisits = pendingVisits,
                CanceledVisits = canceledVisits,
                CompletionRate = totalVisits > 0 ? Math.Round((double)completedVisits / totalVisits * 100, 1) : 0,
                TotalRevenue = totalRevenue,
                CollectedRevenue = collectedRevenue,
                InsurancePaid = insurancePaid,
                PendingDebt = pendingDebt,
                TotalMedicines = totalMedicines,
                LowStockMedicines = lowStockMedicines,
                ExpiringBatches = expiringBatches,
                InventoryValue = inventoryValue,
                StaffCount = staffCount,
                DoctorsCount = doctorsCount
            },
            Trends = trends,
            DepartmentRevenue = deptRevenue
        };
    }
}
