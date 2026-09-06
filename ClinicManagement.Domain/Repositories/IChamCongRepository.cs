using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Repositories
{
    public interface IChamCongRepository
    {
        Task<ChamCong?> GetByScheduleIdAsync(int scheduleId, CancellationToken cancellationToken = default);
        Task<ChamCong?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<LichLamViec?> GetScheduleAsync(int scheduleId, CancellationToken cancellationToken = default);
        Task<bool> HasApprovedLeaveAsync(int employeeId, DateTime date, CancellationToken cancellationToken = default);
        Task<int> MarkApprovedLeaveAsync(int employeeId, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
        Task<int> RestoreCancelledLeaveAsync(int employeeId, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
        Task<int> FinalizeAbsentAsync(DateTime now, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ChamCong>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int? employeeId = null, CancellationToken cancellationToken = default);
        Task<int> CountEmployeesInPeriodAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
        Task AddAsync(ChamCong entity, CancellationToken cancellationToken = default);
        void Update(ChamCong entity);
        Task<DieuChinhChamCong?> GetAdjustmentAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<DieuChinhChamCong>> GetAdjustmentsAsync(DateTime? fromDate = null, DateTime? toDate = null, TrangThaiDieuChinhChamCong? status = null, CancellationToken cancellationToken = default);
        Task AddAdjustmentAsync(DieuChinhChamCong entity, CancellationToken cancellationToken = default);
        void UpdateAdjustment(DieuChinhChamCong entity);
        Task<bool> IsPeriodLockedAsync(DateTime date, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<KyChamCong>> GetPeriodsAsync(CancellationToken cancellationToken = default);
        Task<KyChamCong?> GetPeriodAsync(int id, CancellationToken cancellationToken = default);
        Task AddPeriodAsync(KyChamCong entity, CancellationToken cancellationToken = default);
        void UpdatePeriod(KyChamCong entity);
        Task AddAuditAsync(string table, int recordId, string action, string oldData, string newData, int? userId, CancellationToken cancellationToken = default);
        IUnitOfWork UnitOfWork { get; }
    }
}
