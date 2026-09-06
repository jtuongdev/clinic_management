using Microsoft.EntityFrameworkCore;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;


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
                    assignment.TuNgay.Date <= targetDate &&
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

        public async Task<List<Quyen>> GetPermissionsByUserIdAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.Set<NhanVienVaiTro>()
                .AsNoTracking()
                .Where(nvvt => nvvt.MaNhanVien == userId &&
                    nvvt.NgayBatDau.Date <= today &&
                    (nvvt.NgayKetThuc == null || nvvt.NgayKetThuc.Value.Date >= today))
                .SelectMany(nvvt => nvvt.VaiTro!.VaiTroQuyens)
                .Select(vtq => vtq.Quyen)
                .Where(q => q != null)
                .Distinct()
                .ToListAsync()!;
        }
       
        public async Task<List<NhanVien>> GetBacSiByKhoaAsync(
            int maKhoa,
            int maCoSo,
            CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow.Date;
            var now = DateTime.UtcNow.TimeOfDay;

            // Lấy danh sách ca làm việc đang diễn ra (ThoiGianBatDau <= now <= ThoiGianKetThuc)
            var activeCaLam = await _context.CaTrucs
                .Where(c => c.ThoiGianBatDau <= now && c.ThoiGianKetThuc >= now)
                .Select(c => c.Id)
                .ToListAsync(cancellationToken);

            // Lấy danh sách nhân viên có lịch làm việc hôm nay và đang trong ca
            var nhanVienIdsWithLichLam = await _context.LichLamViecs
                .Where(llv => llv.NgayLam.Date == today && activeCaLam.Contains(llv.MaCaTruc))
                .Select(llv => llv.MaNhanVien)
                .Distinct()
                .ToListAsync(cancellationToken);

            // Nếu không có ca làm việc nào, trả về danh sách rỗng
            if (!activeCaLam.Any())
                return new List<NhanVien>();

            // Nếu không có nhân viên nào có lịch làm việc, trả về rỗng
            if (!nhanVienIdsWithLichLam.Any())
                return new List<NhanVien>();

            // Query chính
            return await _context.NhanViens
                .AsNoTracking()
                .Include(nv => nv.NhanVienKhoa)
                    .ThenInclude(nvk => nvk.Khoa)
                .Where(nv => nv.MaChucVu == 4) // Bác sĩ
                .Where(nv => nv.IsActive && !nv.IsDeleted)
                .Where(nv => nv.NhanVienKhoa.Any(nvk =>
                    nvk.MaKhoa == maKhoa &&
                    nvk.TuNgay <= today &&
                    (nvk.DenNgay == null || nvk.DenNgay >= today)
                ))
                .Where(nv => nv.PhanQuyenCoSo.Any(pq =>
                    pq.MaCoSo == maCoSo &&
                    pq.NgayBatDau.Date <= today &&
                    (pq.NgayKetThuc == null || pq.NgayKetThuc.Value.Date >= today)
                ))
                .Where(nv => nhanVienIdsWithLichLam.Contains(nv.Id)) // Chỉ lấy nhân viên có lịch làm việc
                .ToListAsync(cancellationToken);
        }
            
    
    }
}
