using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class ChamCongRepository : IChamCongRepository
    {
        private readonly ClinicDbContext context;
        public ChamCongRepository(ClinicDbContext context) => this.context = context;
        public IUnitOfWork UnitOfWork => context;
        public Task<ChamCong?> GetByScheduleIdAsync(int scheduleId, CancellationToken cancellationToken = default)
            => context.ChamCongs.Include(x => x.NhanVien).Include(x => x.LichLamViec).ThenInclude(x => x!.CaTruc)
                .FirstOrDefaultAsync(x => x.MaLichLamViec == scheduleId, cancellationToken);
        public Task<ChamCong?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
            => context.ChamCongs.Include(x => x.NhanVien).Include(x => x.LichLamViec).ThenInclude(x => x!.CaTruc).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        public Task<LichLamViec?> GetScheduleAsync(int scheduleId, CancellationToken cancellationToken = default)
            => context.LichLamViecs.Include(x => x.NhanVien).Include(x => x.CaTruc)
                .FirstOrDefaultAsync(x => x.Id == scheduleId, cancellationToken);
        public Task<bool> HasApprovedLeaveAsync(int employeeId, DateTime date, CancellationToken cancellationToken = default)
            => context.NghiPheps.AnyAsync(x => x.MaNhanVien == employeeId &&
                x.TrangThai == TrangThaiNghiPhep.DA_DUYET && x.TuNgay.Date <= date.Date && x.DenNgay.Date >= date.Date, cancellationToken);
        public async Task<int> MarkApprovedLeaveAsync(int employeeId, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
        {
            var schedules = await context.LichLamViecs
                .Where(schedule => schedule.MaNhanVien == employeeId &&
                    schedule.NgayLam >= fromDate.Date && schedule.NgayLam <= toDate.Date &&
                    schedule.TrangThai == TrangThaiLichLamViec.NGHI)
                .Select(schedule => schedule.Id)
                .ToListAsync(cancellationToken);
            var leave = await context.NghiPheps.AsNoTracking()
                .Where(x => x.MaNhanVien == employeeId && x.TrangThai == TrangThaiNghiPhep.DA_DUYET &&
                    x.TuNgay <= toDate.Date && x.DenNgay >= fromDate.Date)
                .OrderByDescending(x => x.Id).ToListAsync(cancellationToken);
            var attendances = await context.ChamCongs
                .Where(attendance => attendance.MaNhanVien == employeeId &&
                    attendance.NgayChamCong >= fromDate.Date && attendance.NgayChamCong <= toDate.Date &&
                    attendance.CheckIn == null && attendance.CheckOut == null)
                .ToListAsync(cancellationToken);
            foreach (var attendance in attendances)
            {
                var leaveType = leave.FirstOrDefault(x => x.TuNgay <= attendance.NgayChamCong.Date && x.DenNgay >= attendance.NgayChamCong.Date)?.LoaiNghi
                    ?? LoaiNghiPhep.PHEP_NAM;
                attendance.MarkLeave(leaveType);
            }
            return schedules.Count;
        }
        public async Task<int> RestoreCancelledLeaveAsync(int employeeId, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
        {
            var attendances = await context.ChamCongs
                .Where(attendance => attendance.MaNhanVien == employeeId &&
                    attendance.NgayChamCong >= fromDate.Date && attendance.NgayChamCong <= toDate.Date &&
                    attendance.TrangThai == TrangThaiChamCong.NGHI_PHEP &&
                    attendance.CheckIn == null && attendance.CheckOut == null)
                .ToListAsync(cancellationToken);
            foreach (var attendance in attendances) attendance.ApplyAdjustment(null, null,
                attendance.NgayChamCong, attendance.NgayChamCong);
            return attendances.Count;
        }
        public async Task<int> FinalizeAbsentAsync(DateTime now, CancellationToken cancellationToken = default)
        {
            var schedules = await context.LichLamViecs.Include(x => x.CaTruc)
                .Where(x => x.TrangThai == TrangThaiLichLamViec.LAM_VIEC &&
                    x.NgayLam.Date <= now.Date &&
                    !context.KyChamCongs.Any(period => period.DaKhoa && period.TuNgay.Date <= x.NgayLam.Date && period.DenNgay.Date >= x.NgayLam.Date) &&
                    !context.ChamCongs.Any(attendance => attendance.MaLichLamViec == x.Id) &&
                    !context.NghiPheps.Any(leave => leave.MaNhanVien == x.MaNhanVien &&
                        leave.TrangThai == TrangThaiNghiPhep.DA_DUYET &&
                        leave.TuNgay.Date <= x.NgayLam.Date && leave.DenNgay.Date >= x.NgayLam.Date))
                .ToListAsync(cancellationToken);
            schedules = schedules.Where(schedule =>
            {
                var end = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianKetThuc);
                if (schedule.CaTruc.ThoiGianKetThuc <= schedule.CaTruc.ThoiGianBatDau) end = end.AddDays(1);
                return end < now;
            }).ToList();
            foreach (var schedule in schedules)
            {
                var attendance = new ChamCong
                {
                    MaNhanVien = schedule.MaNhanVien,
                    MaLichLamViec = schedule.Id,
                    NgayChamCong = schedule.NgayLam.Date
                };
                attendance.MarkAbsent();
                await context.ChamCongs.AddAsync(attendance, cancellationToken);
            }
            return schedules.Count;
        }
        public async Task<IReadOnlyList<ChamCong>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int? employeeId = null, CancellationToken cancellationToken = default)
        {
            var query = context.ChamCongs.AsNoTracking().Include(x => x.NhanVien).Include(x => x.LichLamViec).ThenInclude(x => x!.CaTruc)
                .Where(x => x.NgayChamCong >= fromDate.Date && x.NgayChamCong < toDate.Date.AddDays(1));
            if (employeeId.HasValue) query = query.Where(x => x.MaNhanVien == employeeId.Value);
            return await query.OrderByDescending(x => x.NgayChamCong).ToListAsync(cancellationToken);
        }
        public Task<int> CountEmployeesInPeriodAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default) =>
            context.ChamCongs.Where(x => x.NgayChamCong >= fromDate.Date && x.NgayChamCong <= toDate.Date)
                .Select(x => x.MaNhanVien).Distinct().CountAsync(cancellationToken);
        public async Task AddAsync(ChamCong entity, CancellationToken cancellationToken = default) => await context.ChamCongs.AddAsync(entity, cancellationToken);
        public void Update(ChamCong entity) => context.ChamCongs.Update(entity);
        public Task<DieuChinhChamCong?> GetAdjustmentAsync(int id, CancellationToken cancellationToken = default)
            => context.DieuChinhChamCongs.Include(x => x.ChamCong).Include(x => x.NhanVien).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        public async Task<IReadOnlyList<DieuChinhChamCong>> GetAdjustmentsAsync(DateTime? fromDate = null, DateTime? toDate = null, TrangThaiDieuChinhChamCong? status = null, CancellationToken cancellationToken = default)
        {
            var q = context.DieuChinhChamCongs.AsNoTracking().Include(x => x.NhanVien).Include(x => x.ChamCong).AsQueryable();
            if (fromDate.HasValue) q = q.Where(x => x.ChamCong.NgayChamCong >= fromDate.Value.Date);
            if (toDate.HasValue) q = q.Where(x => x.ChamCong.NgayChamCong < toDate.Value.Date.AddDays(1));
            if (status.HasValue) q = q.Where(x => x.TrangThai == status.Value);
            return await q.OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);
        }
        public async Task AddAdjustmentAsync(DieuChinhChamCong entity, CancellationToken cancellationToken = default) => await context.DieuChinhChamCongs.AddAsync(entity, cancellationToken);
        public void UpdateAdjustment(DieuChinhChamCong entity) => context.DieuChinhChamCongs.Update(entity);
        public Task<bool> IsPeriodLockedAsync(DateTime date, CancellationToken cancellationToken = default)
            => context.KyChamCongs.AnyAsync(x => x.DaKhoa && x.TuNgay.Date <= date.Date && x.DenNgay.Date >= date.Date, cancellationToken);
        public async Task<IReadOnlyList<KyChamCong>> GetPeriodsAsync(CancellationToken cancellationToken = default) => await context.KyChamCongs.AsNoTracking().OrderByDescending(x => x.TuNgay).ToListAsync(cancellationToken);
        public Task<KyChamCong?> GetPeriodAsync(int id, CancellationToken cancellationToken = default) => context.KyChamCongs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        public async Task AddPeriodAsync(KyChamCong entity, CancellationToken cancellationToken = default) => await context.KyChamCongs.AddAsync(entity, cancellationToken);
        public void UpdatePeriod(KyChamCong entity) => context.KyChamCongs.Update(entity);
        public async Task AddAuditAsync(string table, int recordId, string action, string oldData, string newData, int? userId, CancellationToken cancellationToken = default)
            => await context.AuditLogs.AddAsync(new AuditLog { Bang = table, MaBangGhi = recordId, HanhDong = action, DuLieuCu = oldData, DuLieuMoi = newData, NguoiThucHien = userId, ThoiGian = DateTime.UtcNow }, cancellationToken);
    }
}
