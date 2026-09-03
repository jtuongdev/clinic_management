using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common;
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
                .Include(schedule => schedule.CaTruc)
                .FirstOrDefaultAsync(schedule => schedule.Id == id, cancellationToken);

        public async Task<IReadOnlyList<LichLamViec>> GetByDateRangeAsync(
            DateTime fromDate, DateTime toDate, int? maNhanVien = null,
            CancellationToken cancellationToken = default)
        {
            var query = context.LichLamViecs
                .AsNoTracking()
                .Include(schedule => schedule.NhanVien)
                .Include(schedule => schedule.CaTruc)
                .Where(schedule => schedule.NgayLam >= fromDate.Date && schedule.NgayLam < toDate.Date.AddDays(1));

            if (maNhanVien.HasValue)
                query = query.Where(schedule => schedule.MaNhanVien == maNhanVien.Value);

            return await query.OrderBy(schedule => schedule.NgayLam)
                .ThenBy(schedule => schedule.CaTruc.ThoiGianBatDau)
                .ToListAsync(cancellationToken);
        }

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
    }
}
