using System.Globalization;
using System.Text;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Infrastructure.Persistence;
using ClinicManagement.API.Authorization;
using ClinicManagement.Application.Features.ThongKe.Queries.LayBaoCaoLamSang;
using ClinicManagement.Application.Features.ThongKe.Queries.XuatBaoCaoLamSang;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản trị (Admin) - Bảng điều khiển Tổng quan & Giám sát Hệ thống
/// Cung cấp các số liệu điều hành, tài chính, nhân sự và xuất báo cáo cấp quản trị.
/// Route: api/admin/dashboard
/// Quyền: audit (XEM, TOAN_HE_THONG)
/// </summary>
[ApiController]
[ClinicalAuthorize("audit", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController(ClinicDbContext db, IMediator mediator) : BaseController
{
    /// <summary>
    /// Lấy chỉ số tổng quan điều hành trong ngày (Lượt khám, Doanh thu, Công nợ quá hạn, Tồn kho cảnh báo)
    /// </summary>
    /// <param name="facilityId">Mã cơ sở y tế (tùy chọn)</param>
    /// <param name="date">Ngày thống kê (mặc định hôm nay)</param>
    /// <param name="cancellationToken">Token hủy yêu cầu</param>
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

    /// <summary>
    /// Thống kê tài chính nâng cao (Doanh thu theo ngày, Phương thức thanh toán, Cơ cấu viện phí)
    /// </summary>
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

    /// <summary>
    /// Báo cáo thống kê hoạt động khám chữa bệnh tổng thể
    /// </summary>
    [HttpGet("reports")]
    public async Task<IActionResult> GetReports(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] string? shift = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new LayBaoCaoLamSangQuery
        {
            FacilityId = facilityId,
            DepartmentId = departmentId,
            FromDate = fromDate,
            ToDate = toDate,
            Shift = shift
        }, cancellationToken);

        return Success(result);
    }

    /// <summary>
    /// Thống kê năng suất nhân sự và hoạt động lâm sàng của phòng khám
    /// </summary>
    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff(
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? date = null,
        [FromQuery] string? shift = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = (date ?? DateTime.UtcNow).Date;
        var nextDay = targetDate.AddDays(1);

        // 1. Query danh sách nhân viên đang hoạt động
        var query = db.NhanViens.AsNoTracking()
            .Include(x => x.ChucVu)
            .Include(x => x.NhanVienKhoa)
                .ThenInclude(nk => nk.Khoa)
            .Include(x => x.NhanVienVaiTro)
                .ThenInclude(nv => nv.VaiTro)
            .Where(x => x.IsActive);

        if (facilityId.HasValue && facilityId.Value > 0)
        {
            query = query.Where(x =>
                x.NhanVienKhoa.Any(k => k.Khoa.MaCoSo == facilityId.Value) ||
                x.PhanQuyenCoSo.Any(p => p.MaCoSo == facilityId.Value));
        }

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(x => x.NhanVienKhoa.Any(k => k.MaKhoa == departmentId.Value));
        }

        var allStaff = await query.ToListAsync(cancellationToken);

        // 2. Lấy lịch làm việc trong ngày (nếu có)
        var lichQuery = db.LichLamViecs.AsNoTracking()
            .Include(l => l.CaTruc)
            .Include(l => l.PhongKham)
            .Include(l => l.Khoa)
            .Where(l => l.NgayLam >= targetDate && l.NgayLam < nextDay);

        if (facilityId.HasValue && facilityId.Value > 0)
            lichQuery = lichQuery.Where(l => l.Khoa.MaCoSo == facilityId.Value);

        if (departmentId.HasValue && departmentId.Value > 0)
            lichQuery = lichQuery.Where(l => l.MaKhoa == departmentId.Value);

        var shiftsToday = await lichQuery.ToListAsync(cancellationToken);
        var staffShiftDict = shiftsToday
            .GroupBy(s => s.MaNhanVien)
            .ToDictionary(g => g.Key, g => g.First());

        // 3. Lấy lượt khám hôm nay để đếm tải làm việc của bác sĩ
        var activeVisits = await db.LuotKhams.AsNoTracking()
            .Where(l => l.NgayKham >= targetDate && l.NgayKham < nextDay &&
                        (l.TrangThai == TrangThaiLuotKham.DANG_KHAM || l.TrangThai == TrangThaiLuotKham.CHO_KHAM))
            .GroupBy(l => l.MaBacSi)
            .Select(g => new
            {
                DoctorId = g.Key ?? 0,
                Doing = g.Count(x => x.TrangThai == TrangThaiLuotKham.DANG_KHAM),
                Waiting = g.Count(x => x.TrangThai == TrangThaiLuotKham.CHO_KHAM),
                Total = g.Count()
            })
            .ToListAsync(cancellationToken);

        var visitDict = activeVisits.Where(v => v.DoctorId > 0).ToDictionary(v => v.DoctorId);

        // 4. Map từng nhân sự với vai trò, phòng khám, ca trực, trạng thái
        var staffResult = allStaff.Select(x =>
        {
            var chucVuTen = x.ChucVu?.TenChucVu;
            var vaiTroTen = x.NhanVienVaiTro.Select(v => v.VaiTro.TenVaiTro).FirstOrDefault();

            var isDoctor = (chucVuTen != null && chucVuTen.Contains("Bác sĩ", StringComparison.OrdinalIgnoreCase)) ||
                           (vaiTroTen != null && vaiTroTen.Contains("Bác sĩ", StringComparison.OrdinalIgnoreCase)) ||
                           !string.IsNullOrWhiteSpace(x.SoHanhNghe) ||
                           !string.IsNullOrWhiteSpace(x.ChuyenKhoa);

            var isNurse = (chucVuTen != null && chucVuTen.Contains("Điều dưỡng", StringComparison.OrdinalIgnoreCase)) ||
                          (vaiTroTen != null && vaiTroTen.Contains("Điều dưỡng", StringComparison.OrdinalIgnoreCase));

            var title = !string.IsNullOrWhiteSpace(chucVuTen)
                ? chucVuTen
                : (!string.IsNullOrWhiteSpace(vaiTroTen)
                    ? vaiTroTen
                    : (isDoctor ? "Bác sĩ" : (isNurse ? "Điều dưỡng" : "Nhân viên y tế")));

            var mainKhoa = x.NhanVienKhoa
                .Where(k => (!facilityId.HasValue || k.Khoa.MaCoSo == facilityId.Value))
                .OrderByDescending(k => k.LaKhoaChinh)
                .Select(k => k.Khoa.Ten)
                .FirstOrDefault() ?? (!string.IsNullOrWhiteSpace(x.ChuyenKhoa) ? x.ChuyenKhoa : "--");

            staffShiftDict.TryGetValue(x.Id, out var shiftRecord);
            var room = shiftRecord?.PhongKham?.Ten;
            var shiftName = shiftRecord?.CaTruc?.TenCa;

            visitDict.TryGetValue(x.Id, out var visitStats);
            var waitingCount = visitStats?.Waiting ?? 0;
            var doingCount = visitStats?.Doing ?? 0;

            string status;
            if (shiftRecord?.TrangThai == TrangThaiLichLamViec.NGHI)
            {
                status = "leave";
            }
            else if (isDoctor)
            {
                if (waitingCount >= 4)
                    status = "alert"; // Quá tải (>= 4 lượt chờ)
                else if (doingCount > 0)
                    status = "doing"; // Đang khám
                else if (shiftRecord != null || waitingCount > 0)
                    status = "idle"; // Sẵn sàng chờ bệnh nhân
                else
                    status = "active"; // Sẵn sàng nhận lượt
            }
            else
            {
                status = "active";
            }

            if (string.IsNullOrEmpty(room) && isDoctor)
            {
                var deptObj = x.NhanVienKhoa.FirstOrDefault(k => k.LaKhoaChinh)?.Khoa;
                room = deptObj != null ? $"Phòng khám {deptObj.Ten}" : "--";
            }

            if (string.IsNullOrEmpty(shiftName))
            {
                shiftName = "Ca hành chính (07:30 - 16:30)";
            }

            return new
            {
                id = x.Id,
                name = x.HoTen,
                title,
                isDoctor,
                isNurse,
                specialty = x.ChuyenKhoa,
                dept = mainKhoa,
                room = room ?? "--",
                shift = shiftName,
                status,
                waitingCount,
                phone = x.DienThoai
            };
        }).ToList();

        var total = staffResult.Count;
        var doctors = staffResult.Count(s => s.isDoctor);
        var nurses = staffResult.Count(s => s.isNurse);
        var leaves = staffResult.Count(s => s.status == "leave");
        var onDuty = total - leaves;
        var doing = staffResult.Count(s => s.status == "doing");
        var alert = staffResult.Count(s => s.status == "alert");
        var idle = staffResult.Count(s => s.status == "idle");

        return Success(new
        {
            kpis = new
            {
                total,
                doctors,
                nurses = nurses > 0 ? nurses : Math.Max(0, total - doctors),
                onDuty,
                doing,
                alert,
                idle,
                leave = leaves
            },
            staff = staffResult
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

    /// <summary>
    /// Xuất dữ liệu báo cáo lâm sàng và tài chính ra định dạng CSV hỗ trợ tiếng Việt
    /// </summary>
    [HttpGet("reports/export")]
    public async Task<IActionResult> ExportReports(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] string? shift = null,
        [FromQuery] string format = "csv",
        CancellationToken cancellationToken = default)
    {
        var fileResult = await mediator.Send(new XuatBaoCaoLamSangQuery
        {
            FacilityId = facilityId,
            DepartmentId = departmentId,
            FromDate = fromDate,
            ToDate = toDate,
            Shift = shift,
            Format = format
        }, cancellationToken);

        return File(fileResult.FileContent, fileResult.ContentType, fileResult.FileName);
    }
}
