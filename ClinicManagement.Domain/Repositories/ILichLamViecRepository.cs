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
            int? maKhoa = null,
            CancellationToken cancellationToken = default);
        Task<bool> IsEmployeeAssignedToDepartmentAsync(int maNhanVien, int maKhoa, DateTime ngayLam, CancellationToken cancellationToken = default);
        Task<bool> HasConflictAsync(
            int maNhanVien,
            int maCaTruc,
            DateTime ngayLam,
            int? excludeId = null,
            CancellationToken cancellationToken = default);
        Task AddAsync(LichLamViec entity, CancellationToken cancellationToken = default);
        void Update(LichLamViec entity);
        void SoftDelete(LichLamViec entity, int deletedBy);
        Task<IReadOnlyList<LichLamViecCoDinh>> GetFixedSchedulesAsync(int? maNhanVien, int? maKhoa, CancellationToken cancellationToken = default);
        Task<LichLamViecCoDinh?> GetFixedScheduleByIdAsync(int id, CancellationToken cancellationToken = default);
        Task AddFixedScheduleAsync(LichLamViecCoDinh entity, CancellationToken cancellationToken = default);
        Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default);
        void UpdateFixedSchedule(LichLamViecCoDinh entity);
        void SoftDeleteFixedSchedule(LichLamViecCoDinh entity, int deletedBy);
        Task<bool> DailyScheduleExistsAsync(int maNhanVien, int maCaTruc, DateTime ngayLam, CancellationToken cancellationToken = default);
        Task<bool> EmployeeHasScheduleAsync(int maNhanVien, DateTime ngayLam, CancellationToken cancellationToken = default);
        Task<bool> HasApprovedLeaveAsync(int maNhanVien, DateTime date, CancellationToken cancellationToken = default);
        Task<bool> HasAttendanceAsync(int scheduleId, CancellationToken cancellationToken = default);
        Task<bool> IsPeriodLockedAsync(DateTime date, CancellationToken cancellationToken = default);
        Task<bool> HasFixedScheduleConflictAsync(int maNhanVien, DayOfWeek thuTrongTuan, int maCaTruc,
            DateTime tuNgay, DateTime? denNgay, int? excludeId = null,
            CancellationToken cancellationToken = default);
        Task<int> MarkApprovedLeaveAsync(int maNhanVien, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
        Task<int> RestoreCancelledLeaveAsync(int maNhanVien, DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
        Task AddAdjustmentAsync(LichLamViecDieuChinh adjustment, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<LichLamViecDieuChinh>> GetAdjustmentsAsync(int scheduleId, CancellationToken cancellationToken = default);
        Task<int?> GetEmployeeDepartmentIdAsync(int maNhanVien, DateTime? date = null, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<LichLamViecCoDinh>> GetActiveFixedSchedulesAsync(int? maNhanVien = null, int? maKhoa = null, CancellationToken cancellationToken = default);
        Task<List<LichLamViecCoDinh>> GetFixedSchedulesByEmployeeAsync(int maNhanVien, bool track = false, CancellationToken cancellationToken = default);
        IUnitOfWork UnitOfWork { get; }
    }
}
