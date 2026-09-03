using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class ChamCongRepository : IChamCongRepository
    {
        private readonly ClinicDbContext context;
        public ChamCongRepository(ClinicDbContext context) => this.context = context;
        public IUnitOfWork UnitOfWork => context;
        public Task<ChamCong?> GetByEmployeeDateAsync(int employeeId, DateTime date, CancellationToken cancellationToken = default)
            => context.ChamCongs.FirstOrDefaultAsync(x => x.MaNhanVien == employeeId && x.NgayChamCong == date.Date, cancellationToken);
        public async Task<IReadOnlyList<ChamCong>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int? employeeId = null, CancellationToken cancellationToken = default)
        {
            var query = context.ChamCongs.AsNoTracking().Include(x => x.NhanVien)
                .Where(x => x.NgayChamCong >= fromDate.Date && x.NgayChamCong < toDate.Date.AddDays(1));
            if (employeeId.HasValue) query = query.Where(x => x.MaNhanVien == employeeId.Value);
            return await query.OrderByDescending(x => x.NgayChamCong).ToListAsync(cancellationToken);
        }
        public async Task AddAsync(ChamCong entity, CancellationToken cancellationToken = default) => await context.ChamCongs.AddAsync(entity, cancellationToken);
        public void Update(ChamCong entity) => context.ChamCongs.Update(entity);
    }
}
