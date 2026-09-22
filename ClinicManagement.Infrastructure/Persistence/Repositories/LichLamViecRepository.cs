using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class LichLamViecRepository : ILichLamViecRepository
    {
        private readonly ClinicDbContext context;

        public LichLamViecRepository(ClinicDbContext context)
        {
            this.context = context;
        }

        public IUnitOfWork UnitOfWork => context;

        public async Task<LichLamViec?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
            => await context.LichLamViecs
                .Include(schedule => schedule.NhanVien)
                .Include(schedule => schedule.Khoa)
                .Include(schedule => schedule.PhongKham)
                .Include(schedule => schedule.CaTruc)
                .FirstOrDefaultAsync(schedule => schedule.Id == id, cancellationToken);

        public async Task<IReadOnlyList<LichLamViec>> GetByDateRangeAsync(
            DateTime fromDate, DateTime toDate, int? maNhanVien = null,
            int? maKhoa = null,
            CancellationToken cancellationToken = default)
        {
            var query = context.LichLamViecs
                .AsNoTracking()
                .Include(schedule => schedule.NhanVien)
                .Include(schedule => schedule.Khoa)
                .Include(schedule => schedule.PhongKham)
                .Include(schedule => schedule.CaTruc)
                .Where(schedule => schedule.NgayLam >= fromDate.Date && schedule.NgayLam < toDate.Date.AddDays(1));

            if (maNhanVien.HasValue)
                query = query.Where(schedule => schedule.MaNhanVien == maNhanVien.Value);
            if (maKhoa.HasValue) query = query.Where(schedule => schedule.MaKhoa == maKhoa.Value);

            return await query.OrderBy(schedule => schedule.NgayLam)
                .ThenBy(schedule => schedule.CaTruc.ThoiGianBatDau)
                .ToListAsync(cancellationToken);
        }

        public Task<bool> IsEmployeeAssignedToDepartmentAsync(
            int maNhanVien, int maKhoa, DateTime ngayLam,
            CancellationToken cancellationToken = default)
            => context.Set<NhanVienKhoa>().AnyAsync(assignment =>
                assignment.MaNhanVien == maNhanVien &&
                assignment.MaKhoa == maKhoa &&
                assignment.TuNgay.Date <= ngayLam.Date &&
                (assignment.DenNgay == null || assignment.DenNgay.Value.Date >= ngayLam.Date),
                cancellationToken);

        public async Task<bool> HasConflictAsync(
            int maNhanVien, int maCaTruc, DateTime ngayLam, int? excludeId = null,
            CancellationToken cancellationToken = default)
        {
            var shift = await context.CaTrucs.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == maCaTruc, cancellationToken);
            if (shift == null) return true;

            var day = ngayLam.Date;
            var schedules = await context.LichLamViecs
                .AsNoTracking()
                .Include(item => item.CaTruc)
                .Where(item => item.MaNhanVien == maNhanVien &&
                    item.TrangThai == TrangThaiLichLamViec.LAM_VIEC &&
                    item.NgayLam >= day.AddDays(-1) && item.NgayLam < day.AddDays(2) &&
                    (!excludeId.HasValue || item.Id != excludeId.Value))
                .ToListAsync(cancellationToken);

            var requestedStart = day.Add(shift.ThoiGianBatDau);
            var requestedEnd = day.Add(shift.ThoiGianKetThuc);
            if (requestedEnd <= requestedStart) requestedEnd = requestedEnd.AddDays(1);

            return schedules.Any(item =>
            {
                var start = item.NgayLam.Date.Add(item.CaTruc.ThoiGianBatDau);
                var end = item.NgayLam.Date.Add(item.CaTruc.ThoiGianKetThuc);
                if (end <= start) end = end.AddDays(1);
                return requestedStart < end && start < requestedEnd;
            });
        }

        public async Task AddAsync(LichLamViec entity, CancellationToken cancellationToken = default)
            => await context.LichLamViecs.AddAsync(entity, cancellationToken);

        public void Update(LichLamViec entity) => context.LichLamViecs.Update(entity);
        public void SoftDelete(LichLamViec entity, int deletedBy) => entity.SoftDelete(deletedBy);
        public async Task AddAdjustmentAsync(LichLamViecDieuChinh adjustment, CancellationToken cancellationToken = default)
            => await context.LichLamViecDieuChinhs.AddAsync(adjustment, cancellationToken);
        public async Task<IReadOnlyList<LichLamViecDieuChinh>> GetAdjustmentsAsync(int scheduleId, CancellationToken cancellationToken = default)
            => await context.LichLamViecDieuChinhs.AsNoTracking()
                .Where(item => item.MaLichLamViec == scheduleId)
                .OrderByDescending(item => item.ThoiDiem)
                .ToListAsync(cancellationToken);
        public async Task<int> MarkApprovedLeaveAsync(int maNhanVien, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
        {
            var schedules = await context.LichLamViecs
                .Where(item => item.MaNhanVien == maNhanVien &&
                    item.NgayLam >= fromDate.Date && item.NgayLam <= toDate.Date &&
                    item.TrangThai != TrangThaiLichLamViec.NGHI &&
                    !context.ChamCongs.Any(attendance => attendance.MaLichLamViec == item.Id && attendance.CheckIn.HasValue))
                .ToListAsync(cancellationToken);
            foreach (var schedule in schedules) schedule.TrangThai = TrangThaiLichLamViec.NGHI;
            return schedules.Count;
        }
        public async Task<int> RestoreCancelledLeaveAsync(int maNhanVien, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
        {
            var schedules = await context.LichLamViecs
                .Where(item => item.MaNhanVien == maNhanVien &&
                    item.NgayLam >= fromDate.Date && item.NgayLam <= toDate.Date &&
                    item.TrangThai == TrangThaiLichLamViec.NGHI &&
                    !context.ChamCongs.Any(attendance => attendance.MaLichLamViec == item.Id &&
                        (attendance.CheckIn.HasValue || attendance.CheckOut.HasValue)))
                .ToListAsync(cancellationToken);
            foreach (var schedule in schedules) schedule.TrangThai = TrangThaiLichLamViec.LAM_VIEC;
            return schedules.Count;
        }

        public async Task<IReadOnlyList<LichLamViecCoDinh>> GetFixedSchedulesAsync(int? maNhanVien, int? maKhoa, CancellationToken cancellationToken = default)
        {
            IQueryable<LichLamViecCoDinh> query = context.LichLamViecCoDinhs.AsNoTracking()
                .Include(item => item.NhanVien).Include(item => item.Khoa)
                .Include(item => item.CaTruc).Include(item => item.PhongKham);
            if (maNhanVien.HasValue) query = query.Where(item => item.MaNhanVien == maNhanVien.Value);
            if (maKhoa.HasValue) query = query.Where(item => item.MaKhoa == maKhoa.Value);
            return await query.OrderBy(item => item.ThuTrongTuan).ThenBy(item => item.TuNgay).ToListAsync(cancellationToken);
        }

        public Task<LichLamViecCoDinh?> GetFixedScheduleByIdAsync(int id, CancellationToken cancellationToken = default)
            => context.LichLamViecCoDinhs.Include(item => item.NhanVien).Include(item => item.Khoa)
                .Include(item => item.CaTruc).Include(item => item.PhongKham)
                .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        public Task AddFixedScheduleAsync(LichLamViecCoDinh entity, CancellationToken cancellationToken = default)
            => context.LichLamViecCoDinhs.AddAsync(entity, cancellationToken).AsTask();

        public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default)
        {
            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var result = await operation();
                await transaction.CommitAsync(cancellationToken);
                return result;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        public void UpdateFixedSchedule(LichLamViecCoDinh entity) => context.LichLamViecCoDinhs.Update(entity);
        public void SoftDeleteFixedSchedule(LichLamViecCoDinh entity, int deletedBy) => entity.SoftDelete(deletedBy);

        public Task<bool> DailyScheduleExistsAsync(int maNhanVien, int maCaTruc, DateTime ngayLam, CancellationToken cancellationToken = default)
            => context.LichLamViecs.AnyAsync(item => item.MaNhanVien == maNhanVien &&
                item.MaCaTruc == maCaTruc && item.NgayLam == ngayLam.Date, cancellationToken);

        public Task<bool> HasAttendanceAsync(int scheduleId, CancellationToken cancellationToken = default)
            => context.ChamCongs.AnyAsync(item => item.MaLichLamViec == scheduleId, cancellationToken);

        public Task<bool> IsPeriodLockedAsync(DateTime date, CancellationToken cancellationToken = default)
            => context.KyChamCongs.AnyAsync(item => item.DaKhoa &&
                item.TuNgay.Date <= date.Date && item.DenNgay.Date >= date.Date, cancellationToken);

        public Task<bool> HasFixedScheduleConflictAsync(
            int maNhanVien, DayOfWeek thuTrongTuan, int maCaTruc, DateTime tuNgay,
            DateTime? denNgay, int? excludeId = null,
            CancellationToken cancellationToken = default)
            => context.LichLamViecCoDinhs.AnyAsync(item =>
                item.MaNhanVien == maNhanVien &&
                item.ThuTrongTuan == thuTrongTuan &&
                item.MaCaTruc == maCaTruc &&
                (!excludeId.HasValue || item.Id != excludeId.Value) &&
                item.TuNgay.Date <= (denNgay ?? DateTime.MaxValue).Date &&
                (!item.DenNgay.HasValue || item.DenNgay.Value.Date >= tuNgay.Date),
                cancellationToken);

        public async Task<int?> GetEmployeeDepartmentIdAsync(int maNhanVien, DateTime? date = null, CancellationToken cancellationToken = default)
        {
            var checkDate = (date ?? DateTime.Today).Date;
            var assignment = await context.Set<NhanVienKhoa>()
                .Where(item => item.MaNhanVien == maNhanVien &&
                    item.TuNgay.Date <= checkDate &&
                    (item.DenNgay == null || item.DenNgay.Value.Date >= checkDate))
                .OrderByDescending(item => item.TuNgay)
                .FirstOrDefaultAsync(cancellationToken);

            if (assignment != null) return assignment.MaKhoa;

            var fallback = await context.Set<NhanVienKhoa>()
                .Where(item => item.MaNhanVien == maNhanVien)
                .OrderByDescending(item => item.TuNgay)
                .FirstOrDefaultAsync(cancellationToken);

            return fallback?.MaKhoa;
        }

        public async Task<IReadOnlyList<LichLamViecCoDinh>> GetActiveFixedSchedulesAsync(int? maNhanVien = null, int? maKhoa = null, CancellationToken cancellationToken = default)
        {
            IQueryable<LichLamViecCoDinh> query = context.LichLamViecCoDinhs.AsNoTracking()
                .Include(item => item.NhanVien)
                .Include(item => item.Khoa)
                .Include(item => item.CaTruc)
                .Include(item => item.PhongKham)
                .Where(item => item.IsActive && !item.IsDeleted);

            if (maNhanVien.HasValue) query = query.Where(item => item.MaNhanVien == maNhanVien.Value);
            if (maKhoa.HasValue) query = query.Where(item => item.MaKhoa == maKhoa.Value);

            return await query.OrderBy(item => item.ThuTrongTuan).ThenBy(item => item.TuNgay).ToListAsync(cancellationToken);
        }

        public async Task<List<LichLamViecCoDinh>> GetFixedSchedulesByEmployeeAsync(int maNhanVien, bool track = false, CancellationToken cancellationToken = default)
        {
            IQueryable<LichLamViecCoDinh> query = context.LichLamViecCoDinhs;
            if (!track) query = query.AsNoTracking();

            return await query
                .Include(item => item.NhanVien)
                .Include(item => item.CaTruc)
                .Include(item => item.PhongKham)
                .Where(item => item.MaNhanVien == maNhanVien && !item.IsDeleted)
                .OrderBy(item => item.ThuTrongTuan)
                .ToListAsync(cancellationToken);
        }
    }
}
