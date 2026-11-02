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
            .Where(x => x.MaNhanVien == employeeId && 
                       (x.KyLuong.TrangThai == "DA_CHOT" || x.KyLuong.TrangThai == "DA_THANH_TOAN"))
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

    public async Task<IReadOnlyList<LuotKhamHisSnapshot>> GetHisDataForEmployeeAsync(
        int bacSiId, DateTime tuNgay, DateTime denNgay, IReadOnlyDictionary<ClinicManagement.Domain.Common.Enums.LoaiDichVu, decimal>? defaultCommissionRates = null, CancellationToken ct = default)
    {
        var rates = defaultCommissionRates;
        if (rates == null)
        {
            rates = await context.CauHinhHoaHongLoaiDichVus
                .AsNoTracking()
                .ToDictionaryAsync(x => x.LoaiDichVu, x => x.TyLeHoaHong, ct);
        }

        var luotKhams = await context.LuotKhams
            .Include(x => x.ChiDinhDichVus).ThenInclude(c => c.DanhMucDichVu)
            .Where(x => x.MaBacSi == bacSiId
                     && x.NgayKham.Date >= tuNgay.Date
                     && x.NgayKham.Date <= denNgay.Date)
            .AsNoTracking()
            .ToListAsync(ct);

        return luotKhams.Select(lk => new LuotKhamHisSnapshot(
            LaHoanThanh: lk.TrangThai == ClinicManagement.Domain.Common.Enums.TrangThaiLuotKham.HOAN_THANH,
            DichVus: lk.ChiDinhDichVus
                .Where(c => c.DanhMucDichVu != null)
                .Select(c => {
                    var gia = c.DanhMucDichVu!.Gia;
                    var tyLe = c.DanhMucDichVu.TyLeHoaHong ?? rates.GetValueOrDefault(c.DanhMucDichVu.LoaiDichVu, 0m);
                    return new ClsDichVuSnapshot(gia, tyLe);
                })
                .ToList()
        )).ToList();
    }

    public async Task<IReadOnlyList<CauHinhHoaHongLoaiDichVu>> GetCauHinhHoaHongLoaiDichVusAsync(CancellationToken ct = default) =>
        await context.CauHinhHoaHongLoaiDichVus.AsNoTracking().ToListAsync(ct);

    public async Task<CauHinhHoaHongLoaiDichVu?> GetCauHinhHoaHongByLoaiAsync(ClinicManagement.Domain.Common.Enums.LoaiDichVu loaiDichVu, CancellationToken ct = default) =>
        await context.CauHinhHoaHongLoaiDichVus.FirstOrDefaultAsync(x => x.LoaiDichVu == loaiDichVu, ct);

    public async Task SaveCauHinhHoaHongLoaiDichVusAsync(IEnumerable<CauHinhHoaHongLoaiDichVu> configs, CancellationToken ct = default)
    {
        foreach (var config in configs)
        {
            var existing = await context.CauHinhHoaHongLoaiDichVus.FirstOrDefaultAsync(x => x.LoaiDichVu == config.LoaiDichVu, ct);
            if (existing != null)
            {
                existing.TyLeHoaHong = config.TyLeHoaHong;
                existing.GhiChu = config.GhiChu;
            }
            else
            {
                await context.CauHinhHoaHongLoaiDichVus.AddAsync(config, ct);
            }
        }
    }

    public async Task<IReadOnlyList<ChucVu>> GetChucVusAsync(CancellationToken ct = default) =>
        await context.ChucVus.AsNoTracking().OrderBy(x => x.TenChucVu).ToListAsync(ct);

    public async Task<ChucVu?> GetChucVuByIdAsync(int id, CancellationToken ct = default) =>
        await context.ChucVus.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task UpdateChucVuRateAsync(int id, decimal thuLaoMoiLuot, CancellationToken ct = default)
    {
        var cv = await context.ChucVus.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy chức vụ với Id = {id}.");
        cv.ThuLaoMoiLuot = thuLaoMoiLuot;
    }

    public async Task UpdateEmployeeRateAsync(int employeeId, decimal? thuLaoMoiLuot, CancellationToken ct = default)
    {
        var nv = await context.NhanViens.FirstOrDefaultAsync(x => x.Id == employeeId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy nhân viên với Id = {employeeId}.");
        nv.SetThuLaoMoiLuot(thuLaoMoiLuot);
    }

    public async Task UpdateServiceCommissionRateAsync(int serviceId, decimal? tyLeHoaHong, CancellationToken ct = default)
    {
        var dv = await context.DanhMucDichVus.FirstOrDefaultAsync(x => x.Id == serviceId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy dịch vụ với Id = {serviceId}.");
        dv.TyLeHoaHong = tyLeHoaHong;
    }

    public void RemoveBangLuongDetail(ChiTietBangLuong item) => context.Set<ChiTietBangLuong>().Remove(item);
    public void Update(KyLuong period) => context.KyLuongs.Update(period);
}
