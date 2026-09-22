using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Repositories;

public interface IPayrollRepository
{
    IUnitOfWork UnitOfWork { get; }
    Task<IReadOnlyList<KyLuong>> GetPeriodsAsync(CancellationToken ct = default);
    Task<KyLuong?> GetPeriodAsync(int id, bool includeLines = false, CancellationToken ct = default);
    Task AddPeriodAsync(KyLuong period, CancellationToken ct = default);
    Task<IReadOnlyList<NhanVien>> GetActiveEmployeesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ChamCong>> GetAttendanceAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<KyChamCong?> GetAttendancePeriodAsync(int id, CancellationToken ct = default);
    Task<bool> PayrollPeriodExistsAsync(int thang, int nam, CancellationToken ct = default);
    Task<IReadOnlyList<BangLuong>> GetEmployeePayslipsAsync(int employeeId, CancellationToken ct = default);
    Task<BangLuong?> GetBangLuongAsync(int id, bool includeDetails = false, CancellationToken ct = default);
    Task<IReadOnlyList<ChamCong>> GetAttendanceForEmployeeAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default);
    void RemoveBangLuongDetail(ChiTietBangLuong item);
    void Update(KyLuong period);
}
