using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Repositories
{
    public interface INghiPhepRepository
    {
        Task<NghiPhep?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<NghiPhep>> GetAsync(DateTime fromDate, DateTime toDate, int? employeeId = null, string? status = null, CancellationToken cancellationToken = default);
        Task<bool> HasApprovedOverlapAsync(int employeeId, DateTime fromDate, DateTime toDate, int? excludeId = null, CancellationToken cancellationToken = default);
        Task AddAsync(NghiPhep entity, CancellationToken cancellationToken = default);
        void Update(NghiPhep entity);
        IUnitOfWork UnitOfWork { get; }
    }
}
