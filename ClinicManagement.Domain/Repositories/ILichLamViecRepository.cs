using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Repositories
{
    public interface ILichLamViecRepository
    {
        Task<LichLamViec?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<LichLamViec>> GetByDateRangeAsync(
            DateTime fromDate,
            DateTime toDate,
            int? maNhanVien = null,
            CancellationToken cancellationToken = default);
        Task<bool> HasConflictAsync(
            int maNhanVien,
            int maCaTruc,
            DateTime ngayLam,
            int? excludeId = null,
            CancellationToken cancellationToken = default);
        Task AddAsync(LichLamViec entity, CancellationToken cancellationToken = default);
        void Update(LichLamViec entity);
        void SoftDelete(LichLamViec entity, int deletedBy);
        IUnitOfWork UnitOfWork { get; }
    }
}
