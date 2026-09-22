using System.Globalization;
using System.Text;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Infrastructure.Persistence;
using ClinicManagement.API.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.API.Controllers;

[ApiController]
[ClinicalAuthorize("audit", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController(ClinicDbContext db) : BaseController
{
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(
        [FromQuery] int? facilityId = null,
        [FromQuery] DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var day = (date ?? DateTime.UtcNow).Date;
        var nextDay = day.AddDays(1);
        var visitQuery = db.LuotKhams.AsNoTracking()
            .Where(x => x.NgayKham >= day && x.NgayKham < nextDay);
        if (facilityId.HasValue)
            visitQuery = visitQuery.Where(x => x.MaCoSo == facilityId.Value);

        var invoiceQuery = db.HoaDons.AsNoTracking()
            .Where(x => x.NgayLap >= day && x.NgayLap < nextDay);
        if (facilityId.HasValue)
            invoiceQuery = invoiceQuery.Where(x => x.MaCoSo == facilityId.Value);

        var monthStart = new DateTime(day.Year, day.Month, 1);
        var monthInvoices = db.HoaDons.AsNoTracking().Where(x => x.NgayLap >= monthStart && x.NgayLap < nextDay);
        if (facilityId.HasValue)
            monthInvoices = monthInvoices.Where(x => x.MaCoSo == facilityId.Value);

        var overdueRows = await db.CongNoBenhNhans.AsNoTracking()
            .Where(x => x.TrangThai == TrangThaiCongNo.QUA_HAN &&
                        (!facilityId.HasValue || x.HoaDon.MaCoSo == facilityId.Value))
            .OrderByDescending(x => x.SoTienNo - x.SoTienDaTra)
            .Take(10)
            .Select(x => new
            {
                debtor = x.BenhNhan.Ho + " " + x.BenhNhan.Ten,
                badge = "Quá hạn",
                amount = x.SoTienNo - x.SoTienDaTra
            })
            .ToListAsync(cancellationToken);
        var overdue = overdueRows.Select(x => new
        {
            x.debtor,
            x.badge,
            badgeColor = "danger",
            amount = x.amount.ToString("N0", CultureInfo.GetCultureInfo("vi-VN")) + " đ",
            amountColor = "overdue"
        }).ToList();

        var auditActivities = await db.NhatKyHeThongs.AsNoTracking()
            .OrderByDescending(x => x.ThoiGian)
            .Take(10)
            .Select(x => new
            {
                x.HanhDong,
                x.Bang,
                x.MaBangGhi,
                x.ThoiGian
            })
            .ToListAsync(cancellationToken);

        var result = new
        {
            date = day,
            totalPatients = await db.BenhNhans.AsNoTracking().CountAsync(cancellationToken),
            visitsToday = await visitQuery.CountAsync(cancellationToken),
            pendingVisits = await visitQuery.CountAsync(x =>
                x.TrangThai == TrangThaiLuotKham.CHO_KHAM, cancellationToken),
            revenueMonth = await monthInvoices.SumAsync(x => (decimal?)x.DaThanhToan, cancellationToken) ?? 0,
            overdueDebt = await db.CongNoBenhNhans.AsNoTracking()
                .Where(x => x.TrangThai == TrangThaiCongNo.QUA_HAN &&
                            (!facilityId.HasValue || x.HoaDon.MaCoSo == facilityId.Value))
                .SumAsync(x => (decimal?)(x.SoTienNo - x.SoTienDaTra), cancellationToken) ?? 0,
            invoicesToday = await invoiceQuery.CountAsync(cancellationToken),
            overdueDebts = overdue,
            activities = auditActivities.Select(x => new
            {
                dotColor = ActivityColor(x.HanhDong),
                text = x.HanhDong,
                highlight = $"{x.Bang} #{x.MaBangGhi}",
                time = x.ThoiGian.ToString("dd/MM/yyyy HH:mm")
            }).ToList()
        };

        return Success(result);
    }

    [HttpGet("finance")]
    public async Task<IActionResult> GetFinance(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? facilityId = null,
        CancellationToken cancellationToken = default)
    {
        var from = (fromDate ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1)).Date;
        var to = (toDate ?? DateTime.UtcNow).Date.AddDays(1);
        var query = db.HoaDons.AsNoTracking().Where(x => x.NgayLap >= from && x.NgayLap < to);
        if (facilityId.HasValue)
            query = query.Where(x => x.MaCoSo == facilityId.Value);

        var invoices = await query.OrderByDescending(x => x.NgayLap)
            .Select(x => new
            {
                code = x.SoHoaDon,
                patient = x.BenhNhan.Ho + " " + x.BenhNhan.Ten,
                total = x.TongTien,
                remaining = x.SoTienBenhNhanChiTra - x.DaThanhToan,
                status = x.TrangThai == TrangThaiHoaDon.DA_THANH_TOAN
                    ? "paid"
                    : x.DaThanhToan > 0 ? "partial" : "unpaid"
            })
            .ToListAsync(cancellationToken);

        return Success(new
        {
            kpis = new
            {
                revenue = invoices.Sum(x => x.total),
                unpaid = invoices.Sum(x => x.remaining),
                paid = invoices.Sum(x => x.total - x.remaining),
                insurance = await query.SumAsync(x => (decimal?)x.SoTienBaoHiemChiTra, cancellationToken) ?? 0,
                overdue = await db.CongNoBenhNhans.AsNoTracking()
                    .Where(x => x.TrangThai == TrangThaiCongNo.QUA_HAN)
                    .SumAsync(x => (decimal?)(x.SoTienNo - x.SoTienDaTra), cancellationToken) ?? 0,
                invoiceCount = invoices.Count
            },
            invoices
        });
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? facilityId = null,
        CancellationToken cancellationToken = default)
    {
        var from = (fromDate ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1)).Date;
        var to = (toDate ?? DateTime.UtcNow).Date.AddDays(1);
        var visits = db.LuotKhams.AsNoTracking()
            .Where(x => x.NgayKham >= from && x.NgayKham < to &&
                        x.TrangThai == TrangThaiLuotKham.HOAN_THANH);
        if (facilityId.HasValue)
            visits = visits.Where(x => x.MaCoSo == facilityId.Value);

        var invoiceReportQuery = db.HoaDons.AsNoTracking()
            .Where(x => x.NgayLap >= from && x.NgayLap < to);
        if (facilityId.HasValue)
            invoiceReportQuery = invoiceReportQuery.Where(x => x.MaCoSo == facilityId.Value);

        var revenue = await invoiceReportQuery
            .GroupBy(x => x.LuotKham.Khoa != null ? x.LuotKham.Khoa.Ten : "Chưa phân loại")
            .Select(g => new { name = g.Key, value = g.Sum(x => x.DaThanhToan) })
            .OrderByDescending(x => x.value)
            .ToListAsync(cancellationToken);

        var doctors = await visits.Where(x => x.MaBacSi.HasValue)
            .GroupBy(x => new { x.MaBacSi, name = x.BacSi.HoTen, department = x.Khoa.Ten })
            .Select(g => new { name = g.Key.name, department = g.Key.department, count = g.Count() })
            .OrderByDescending(x => x.count)
            .Take(20)
            .ToListAsync(cancellationToken);

        return Success(new
        {
            kpis = new
            {
                revenue = revenue.Sum(x => x.value),
                completedVisits = await visits.CountAsync(cancellationToken),
                activeDoctors = await db.NhanViens.AsNoTracking().CountAsync(x => x.IsActive && x.ChuyenKhoa != "", cancellationToken),
                openDepartments = await db.Khoas.AsNoTracking().CountAsync(x => !facilityId.HasValue || x.MaCoSo == facilityId.Value, cancellationToken),
                bhytReimbursementRate = await GetReimbursementRateAsync(invoiceReportQuery, cancellationToken)
            },
            revenueByDepartment = revenue,
            doctorKpis = doctors.Select((x, index) => new
            {
                rank = index + 1,
                name = x.name,
                department = x.department,
                count = x.count
            })
        });
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff(
        [FromQuery] int? facilityId = null,
        CancellationToken cancellationToken = default)
    {
        var staff = await db.NhanViens.AsNoTracking()
            .Where(x => x.IsActive)
            .Select(x => new
            {
                id = x.Id,
                name = x.HoTen,
                dept = x.NhanVienKhoa
                    .Where(k => k.LaKhoaChinh && (!facilityId.HasValue || k.Khoa.MaCoSo == facilityId.Value))
                    .Select(k => k.Khoa.Ten)
                    .FirstOrDefault() ?? x.ChuyenKhoa,
                room = (string?)null,
                shift = (string?)null,
                status = "active"
            })
            .ToListAsync(cancellationToken);

        return Success(new
        {
            kpis = new
            {
                total = staff.Count,
                doctors = await db.NhanViens.AsNoTracking().CountAsync(x => x.IsActive && x.ChuyenKhoa != "", cancellationToken),
                onDuty = staff.Count,
                leave = 0
            },
            staff
        });
    }

    private static string ActivityColor(string action)
        => action.Contains("DELETE", StringComparison.OrdinalIgnoreCase) ||
           action.Contains("HUY", StringComparison.OrdinalIgnoreCase)
            ? "red"
            : action.Contains("PAY", StringComparison.OrdinalIgnoreCase) ||
              action.Contains("THU", StringComparison.OrdinalIgnoreCase)
                ? "orange"
                : action.Contains("PRESCRIBE", StringComparison.OrdinalIgnoreCase) ||
                  action.Contains("DON", StringComparison.OrdinalIgnoreCase)
                    ? "green"
                    : "blue";

    [HttpGet("reports/export")]
    public async Task<IActionResult> ExportReports(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? facilityId = null,
        CancellationToken cancellationToken = default)
    {
        var from = (fromDate ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1)).Date;
        var to = (toDate ?? DateTime.UtcNow).Date.AddDays(1);
        var invoiceQuery = db.HoaDons.AsNoTracking().Where(x => x.NgayLap >= from && x.NgayLap < to);
        if (facilityId.HasValue)
            invoiceQuery = invoiceQuery.Where(x => x.MaCoSo == facilityId.Value);
        var revenue = await invoiceQuery
            .GroupBy(x => x.LuotKham.Khoa != null ? x.LuotKham.Khoa.Ten : "Chưa phân loại")
            .Select(g => new { name = g.Key, value = g.Sum(x => x.DaThanhToan) })
            .OrderByDescending(x => x.value)
            .ToListAsync(cancellationToken);
        var visits = db.LuotKhams.AsNoTracking()
            .Where(x => x.NgayKham >= from && x.NgayKham < to &&
                        x.TrangThai == TrangThaiLuotKham.HOAN_THANH);
        if (facilityId.HasValue)
            visits = visits.Where(x => x.MaCoSo == facilityId.Value);
        var doctors = await visits.Where(x => x.MaBacSi.HasValue)
            .GroupBy(x => new { x.MaBacSi, name = x.BacSi.HoTen, department = x.Khoa.Ten })
            .Select(g => new { name = g.Key.name, department = g.Key.department, count = g.Count() })
            .OrderByDescending(x => x.count)
            .Take(20)
            .ToListAsync(cancellationToken);
        var csv = new StringBuilder();
        csv.AppendLine("Loai,Ten,ChiTiet,SoLuong,GiaTri");
        csv.AppendLine($"KPI,\"Doanh thu\",\"{from:O} - {to:O}\",{await visits.CountAsync(cancellationToken)},{revenue.Sum(x => x.value).ToString(CultureInfo.InvariantCulture)}");
        foreach (var row in revenue)
            csv.AppendLine($"DoanhThuKhoa,{Csv(row.name)},,," +
                           row.value.ToString(CultureInfo.InvariantCulture));
        foreach (var row in doctors)
            csv.AppendLine($"KPIBacSi,{Csv(row.name)},{Csv(row.department)},{row.count},");
        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv; charset=utf-8",
            $"bao-cao-kham-benh-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    private async Task<decimal?> GetReimbursementRateAsync(
        IQueryable<ClinicManagement.Domain.Billing.HoaDon> query,
        CancellationToken cancellationToken)
    {
        var totals = await query.Select(x => new { x.TongTien, x.SoTienBaoHiemChiTra })
            .ToListAsync(cancellationToken);
        var total = totals.Sum(x => x.TongTien);
        return total <= 0 ? null : Math.Round(totals.Sum(x => x.SoTienBaoHiemChiTra) / total * 100, 2);
    }

    private static string Csv(string value)
        => $"\"{value.Replace("\"", "\"\"")}\"";
}
