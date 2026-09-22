using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories;

public sealed class PayrollRepository(ClinicDbContext context) : IPayrollRepository
{
    public IUnitOfWork UnitOfWork => context;
    public async Task<IReadOnlyList<KyLuong>> GetPeriodsAsync(CancellationToken ct = default) =>
        await context.KyLuongs.AsNoTracking().OrderByDescending(x => x.Nam).ThenByDescending(x => x.Thang).ToListAsync(ct);
    public Task<KyLuong?> GetPeriodAsync(int id, bool includeLines = false, CancellationToken ct = default)
    {
        IQueryable<KyLuong> q = context.KyLuongs;
        if (includeLines)
        {
            q = q.Include(x => x.BangLuongs).ThenInclude(x => x.ChiTiets)
                 .Include(x => x.BangLuongs).ThenInclude(x => x.NhanVien).ThenInclude(x => x.ChucVu)
                 .Include(x => x.BangLuongs).ThenInclude(x => x.NhanVien).ThenInclude(x => x.NhanVienKhoa).ThenInclude(x => x.Khoa);
        }
        return q.FirstOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task AddPeriodAsync(KyLuong period, CancellationToken ct = default) => await context.KyLuongs.AddAsync(period, ct);
    public async Task<IReadOnlyList<NhanVien>> GetActiveEmployeesAsync(CancellationToken ct = default) =>
        await context.NhanViens
            .Include(x => x.ChucVu)
            .Include(x => x.NhanVienKhoa).ThenInclude(x => x.Khoa)
            .Where(x => x.IsActive)
            .ToListAsync(ct);
    public async Task<IReadOnlyList<ChamCong>> GetAttendanceAsync(DateTime from, DateTime to, CancellationToken ct = default) =>
        await context.ChamCongs.Include(x => x.LichLamViec).ThenInclude(x => x!.CaTruc)
            .Where(x => x.NgayChamCong >= from.Date && x.NgayChamCong < to.Date.AddDays(1)).ToListAsync(ct);
    public Task<KyChamCong?> GetAttendancePeriodAsync(int id, CancellationToken ct = default) =>
        context.KyChamCongs.FirstOrDefaultAsync(x => x.Id == id, ct);
    public Task<bool> PayrollPeriodExistsAsync(int thang, int nam, CancellationToken ct = default) =>
        context.KyLuongs.AnyAsync(x => x.Thang == thang && x.Nam == nam, ct);
    public async Task<IReadOnlyList<BangLuong>> GetEmployeePayslipsAsync(int employeeId, CancellationToken ct = default) =>
        await context.BangLuongs
            .Include(x => x.KyLuong)
            .Include(x => x.NhanVien).ThenInclude(x => x.ChucVu)
            .Include(x => x.NhanVien).ThenInclude(x => x.NhanVienKhoa).ThenInclude(x => x.Khoa)
            .Include(x => x.ChiTiets)
            .Where(x => x.MaNhanVien == employeeId)
            .OrderByDescending(x => x.KyLuong.Nam)
            .ThenByDescending(x => x.KyLuong.Thang)
            .ToListAsync(ct);
    public Task<BangLuong?> GetBangLuongAsync(int id, bool includeDetails = false, CancellationToken ct = default)
    {
        IQueryable<BangLuong> q = context.BangLuongs;
        if (includeDetails)
        {
            q = q.Include(x => x.KyLuong)
                 .Include(x => x.ChiTiets)
                 .Include(x => x.NhanVien).ThenInclude(x => x.ChucVu)
                 .Include(x => x.NhanVien).ThenInclude(x => x.NhanVienKhoa).ThenInclude(x => x.Khoa);
        }
        return q.FirstOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<ChamCong>> GetAttendanceForEmployeeAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default) =>
        await context.ChamCongs.Include(x => x.LichLamViec).ThenInclude(x => x!.CaTruc)
            .Where(x => x.MaNhanVien == employeeId && x.NgayChamCong >= from.Date && x.NgayChamCong < to.Date.AddDays(1))
            .OrderBy(x => x.NgayChamCong)
            .ToListAsync(ct);
    public void RemoveBangLuongDetail(ChiTietBangLuong item) => context.Set<ChiTietBangLuong>().Remove(item);
    public void Update(KyLuong period) => context.KyLuongs.Update(period);
}
