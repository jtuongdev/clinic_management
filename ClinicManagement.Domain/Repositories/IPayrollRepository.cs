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
    Task<IReadOnlyList<LuotKhamHisSnapshot>> GetHisDataForEmployeeAsync(
        int bacSiId, DateTime tuNgay, DateTime denNgay, IReadOnlyDictionary<ClinicManagement.Domain.Common.Enums.LoaiDichVu, decimal>? defaultCommissionRates = null, CancellationToken ct = default);
    Task<IReadOnlyList<CauHinhHoaHongLoaiDichVu>> GetCauHinhHoaHongLoaiDichVusAsync(CancellationToken ct = default);
    Task<CauHinhHoaHongLoaiDichVu?> GetCauHinhHoaHongByLoaiAsync(ClinicManagement.Domain.Common.Enums.LoaiDichVu loaiDichVu, CancellationToken ct = default);
    Task SaveCauHinhHoaHongLoaiDichVusAsync(IEnumerable<CauHinhHoaHongLoaiDichVu> configs, CancellationToken ct = default);
    Task<IReadOnlyList<ChucVu>> GetChucVusAsync(CancellationToken ct = default);
    Task<ChucVu?> GetChucVuByIdAsync(int id, CancellationToken ct = default);
    Task UpdateChucVuRateAsync(int id, decimal thuLaoMoiLuot, CancellationToken ct = default);
    Task UpdateEmployeeRateAsync(int employeeId, decimal? thuLaoMoiLuot, CancellationToken ct = default);
    Task UpdateServiceCommissionRateAsync(int serviceId, decimal? tyLeHoaHong, CancellationToken ct = default);
    void RemoveBangLuongDetail(ChiTietBangLuong item);
    void Update(KyLuong period);
}
