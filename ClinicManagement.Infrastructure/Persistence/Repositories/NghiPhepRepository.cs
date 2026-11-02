using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class NghiPhepRepository : INghiPhepRepository
    {
        private readonly ClinicDbContext context;
        public NghiPhepRepository(ClinicDbContext context) => this.context = context;
        public IUnitOfWork UnitOfWork => context;
        public Task<NghiPhep?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
            => context.NghiPheps.Include(x => x.NhanVien).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        public async Task<IReadOnlyList<NghiPhep>> GetAsync(DateTime fromDate, DateTime toDate, int? employeeId = null, string? status = null, CancellationToken cancellationToken = default)
        {
            var query = context.NghiPheps.AsNoTracking().Include(x => x.NhanVien)
                .Where(x => x.TuNgay <= toDate.Date && x.DenNgay >= fromDate.Date);
            if (employeeId.HasValue) query = query.Where(x => x.MaNhanVien == employeeId.Value);
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TrangThaiNghiPhep>(status, true, out var parsedStatus))
                query = query.Where(x => x.TrangThai == parsedStatus);
            return await query.OrderByDescending(x => x.TuNgay).ToListAsync(cancellationToken);
        }
        public Task<bool> HasApprovedOverlapAsync(int employeeId, DateTime fromDate, DateTime toDate, int? excludeId = null, CancellationToken cancellationToken = default)
            => context.NghiPheps.AnyAsync(x => x.MaNhanVien == employeeId && x.TrangThai == TrangThaiNghiPhep.DA_DUYET && (!excludeId.HasValue || x.Id != excludeId.Value) && x.TuNgay <= toDate.Date && x.DenNgay >= fromDate.Date, cancellationToken);
        public async Task AddAsync(NghiPhep entity, CancellationToken cancellationToken = default) => await context.NghiPheps.AddAsync(entity, cancellationToken);
        public void Update(NghiPhep entity) => context.NghiPheps.Update(entity);
    }
}
