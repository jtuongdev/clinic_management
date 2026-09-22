using Microsoft.EntityFrameworkCore;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.System;


namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class NhanVienRepository : Repository<NhanVien>, INhanVienRepository
    {
        public NhanVienRepository(ClinicDbContext context) : base(context) { }

        public async Task<NhanVien?> GetByUsernameAsync(string username)
            => await _dbSet
                .FirstOrDefaultAsync(n => n.Username == username && !n.IsDeleted);

        public async Task<NhanVien?> GetByEmailAsync(string email)
            => await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.Email == email && !n.IsDeleted);

        public async Task<bool> IsUsernameExistAsync(string username)
            => await _dbSet
                .AsNoTracking()
                .AnyAsync(n => n.Username == username && !n.IsDeleted);

        public async Task<bool> IsEmailExistAsync(string email, int? excludeId = null)
            => await _dbSet.AsNoTracking()
                .AnyAsync(n => n.Email == email && !n.IsDeleted && (!excludeId.HasValue || n.Id != excludeId.Value));

        public async Task<bool> IsSoHanhNgheExistAsync(string soHanhNghe, int? excludeId = null)
            => await _dbSet.AsNoTracking()
                .AnyAsync(n => n.SoHanhNghe == soHanhNghe && !n.IsDeleted && (!excludeId.HasValue || n.Id != excludeId.Value));

        public async Task<NhanVien?> GetDetailByIdAsync(int id, CancellationToken cancellationToken = default)
            => await _dbSet
                .AsNoTracking()
                .Include(n => n.ChucVu)
                .Include(n => n.NhanVienVaiTro).ThenInclude(n => n.VaiTro)
                .Include(n => n.NhanVienKhoa).ThenInclude(n => n.Khoa)
                .FirstOrDefaultAsync(n => n.Id == id && !n.IsDeleted, cancellationToken);

        public async Task<IReadOnlyList<NhanVien>> GetPagedAsync(
            string? keyword, int? maChucVu, bool? isActive, int? maKhoa, DateTime? ngay, int pageIndex, int pageSize,
            CancellationToken cancellationToken = default)
        {
            var query = BuildEmployeeQuery(keyword, maChucVu, isActive, maKhoa, ngay);
            return await query.OrderBy(n => n.HoTen)
                .ThenBy(n => n.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> CountPagedAsync(
            string? keyword, int? maChucVu, bool? isActive, int? maKhoa, DateTime? ngay,
            CancellationToken cancellationToken = default)
            => await BuildEmployeeQuery(keyword, maChucVu, isActive, maKhoa, ngay).CountAsync(cancellationToken);

        private IQueryable<NhanVien> BuildEmployeeQuery(string? keyword, int? maChucVu, bool? isActive, int? maKhoa = null, DateTime? ngay = null)
        {
            var query = _dbSet.AsNoTracking().Include(n => n.ChucVu).Where(n => !n.IsDeleted);
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var value = keyword.Trim();
                query = query.Where(n => n.Username.Contains(value) || n.HoTen.Contains(value) || n.Email.Contains(value));
            }
            if (maChucVu.HasValue) query = query.Where(n => n.MaChucVu == maChucVu.Value);
            if (isActive.HasValue) query = query.Where(n => n.IsActive == isActive.Value);
            if (maKhoa.HasValue)
            {
                var targetDate = (ngay ?? DateTime.UtcNow).Date;
                query = query.Where(n => n.NhanVienKhoa.Any(assignment =>
                    assignment.MaKhoa == maKhoa.Value &&
                    (assignment.DenNgay == null || assignment.DenNgay.Value.Date >= targetDate)));
            }
            return query;
        }

        public async Task<IReadOnlyList<NhanVien>> GetActiveDoctorsAsync()
            => await _dbSet
                .AsNoTracking()
                .Where(n => n.IsActive && !n.IsDeleted && n.ChuyenKhoa != null)
                .ToListAsync();
        public async Task<List<VaiTro>> GetRolesByUserIdAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.Set<NhanVienVaiTro>()
                .AsNoTracking()
                .Where(nvvt => nvvt.MaNhanVien == userId &&
                    nvvt.NgayBatDau.Date <= today &&
                    (nvvt.NgayKetThuc == null || nvvt.NgayKetThuc.Value.Date >= today))
                .Select(nvvt => nvvt.VaiTro)
                .Where(vt => vt != null)
                .ToListAsync()!;
        }

        public async Task<List<VaiTro>> GetAllRolesAsync(CancellationToken cancellationToken = default)
            => await _context.Set<VaiTro>()
                .AsNoTracking()
                .Where(role => !role.IsDeleted)
                .OrderBy(role => role.TenVaiTro)
                .ToListAsync(cancellationToken);

        public async Task<List<ChucVu>> GetAllChucVusAsync(CancellationToken cancellationToken = default)
            => await _context.ChucVus
                .AsNoTracking()
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.TenChucVu)
                .ToListAsync(cancellationToken);

        public async Task<List<VaiTro>> GetRolesByIdsAsync(IEnumerable<int> roleIds, CancellationToken cancellationToken = default)
        {
            var ids = roleIds.Distinct().ToList();
            return await _context.Set<VaiTro>()
                .Where(role => ids.Contains(role.Id) && !role.IsDeleted)
                .ToListAsync(cancellationToken);
        }

        public async Task<NhanVien?> GetDetailForUpdateAsync(int id, CancellationToken cancellationToken = default)
            => await _dbSet
                .Include(employee => employee.NhanVienVaiTro)
                .FirstOrDefaultAsync(employee => employee.Id == id && !employee.IsDeleted, cancellationToken);

        public async Task<List<MaTranPhanQuyen>> GetPermissionsByUserIdAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;
            var roleIds = await _context.Set<NhanVienVaiTro>()
                .AsNoTracking()
                .Where(nvvt => nvvt.MaNhanVien == userId &&
                    nvvt.NgayBatDau.Date <= today &&
                    (nvvt.NgayKetThuc == null || nvvt.NgayKetThuc.Value.Date >= today))
                .Select(nvvt => nvvt.MaVaiTro)
                .Distinct()
                .ToListAsync();

            if (roleIds.Count == 0)
                return [];

            return await _context.Set<MaTranPhanQuyen>()
                .AsNoTracking()
                .Where(m => roleIds.Contains(m.MaVaiTro) && m.DuocPhep)
                .ToListAsync();
        }
       
        public async Task<List<BacSiKhoaModel>> GetBacSiByKhoaAsync(
            int maKhoa,
            int maCoSo,
            CancellationToken cancellationToken = default)
        {
            // 1. Tính toán thời gian thực tế theo múi giờ Việt Nam (GMT+7)
            TimeZoneInfo vnTimeZone;
            try
            {
                vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch
            {
                try
                {
                    vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
                }
                catch
                {
                    vnTimeZone = TimeZoneInfo.CreateCustomTimeZone("VN_TIME", TimeSpan.FromHours(7), "Vietnam Time", "Vietnam Time");
                }
            }

            var nowVn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vnTimeZone);
            var todayVn = nowVn.Date;
            var currentTimeVn = nowVn.TimeOfDay;

            // 2. Lấy danh sách ca làm việc đang diễn ra tại thời điểm hiện tại
            var activeCaLamIds = await _context.CaTrucs
                .AsNoTracking()
                .Where(c => c.ThoiGianBatDau <= currentTimeVn && c.ThoiGianKetThuc >= currentTimeVn)
                .Select(c => c.Id)
                .ToListAsync(cancellationToken);

            // 3. Lấy lịch làm việc hôm nay của các bác sĩ thuộc khoa
            var activeDutySchedules = new List<ClinicManagement.Domain.Identity.LichLamViec>();
            if (activeCaLamIds.Count > 0)
            {
                activeDutySchedules = await _context.LichLamViecs
                    .AsNoTracking()
                    .Include(llv => llv.PhongKham)
                    .Where(llv => llv.NgayLam.Date == todayVn &&
                                  llv.MaKhoa == maKhoa &&
                                  activeCaLamIds.Contains(llv.MaCaTruc) &&
                                  llv.TrangThai == ClinicManagement.Domain.Common.Enums.TrangThaiLichLamViec.LAM_VIEC)
                    .ToListAsync(cancellationToken);
            }

            var activeDoctorScheduleMap = activeDutySchedules
                .GroupBy(llv => llv.MaNhanVien)
                .ToDictionary(g => g.Key, g => g.First());

            // 4. Truy vấn danh sách Bác sĩ thuộc Khoa & Cơ sở (BỎ CHẶN CỨNG LỊCH TRỰC)
            var doctors = await _context.NhanViens
                .AsNoTracking()
                .Include(nv => nv.NhanVienKhoa)
                    .ThenInclude(nvk => nvk.Khoa)
                .Include(nv => nv.ChucVu)
                .Where(nv => (nv.ChucVu != null && (nv.ChucVu.TenChucVu.Contains("Bác sĩ") || nv.ChucVu.TenChucVu.Contains("bác sĩ") || nv.ChucVu.TenChucVu.Contains("Bac si") || nv.ChucVu.TenChucVu.Contains("bac si"))) || nv.MaChucVu == 4 || nv.ChuyenKhoa != null)
                .Where(nv => nv.IsActive && !nv.IsDeleted)
                .Where(nv => nv.NhanVienKhoa.Any(nvk =>
                    nvk.MaKhoa == maKhoa &&
                    nvk.TuNgay <= todayVn &&
                    (nvk.DenNgay == null || nvk.DenNgay >= todayVn)
                ))
                .Where(nv => nv.PhanQuyenCoSo.Any(pq =>
                    pq.MaCoSo == maCoSo &&
                    pq.NgayBatDau.Date <= todayVn &&
                    (pq.NgayKetThuc == null || pq.NgayKetThuc.Value.Date >= todayVn)
                ))
                .ToListAsync(cancellationToken);

            // 5. Map ra BacSiKhoaModel kèm cờ Đang trực và Phòng khám mặc định
            return doctors
                .Select(nv =>
                {
                    var isOnDuty = activeDoctorScheduleMap.TryGetValue(nv.Id, out var schedule);
                    return new BacSiKhoaModel
                    {
                        NhanVien = nv,
                        DangTruc = isOnDuty,
                        MaPhongKhamMacDinh = schedule?.MaPhongKham,
                        TenPhongKhamMacDinh = schedule?.PhongKham?.Ten
                    };
                })
                .OrderByDescending(b => b.DangTruc)
                .ThenBy(b => b.NhanVien.HoTen)
                .ToList();
        }
            
    
    }
}
