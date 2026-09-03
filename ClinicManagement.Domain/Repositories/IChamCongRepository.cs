using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Repositories
{
    public interface IChamCongRepository
    {
        Task<ChamCong?> GetByEmployeeDateAsync(int employeeId, DateTime date, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ChamCong>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int? employeeId = null, CancellationToken cancellationToken = default);
        Task AddAsync(ChamCong entity, CancellationToken cancellationToken = default);
        void Update(ChamCong entity);
        IUnitOfWork UnitOfWork { get; }
    }
}
