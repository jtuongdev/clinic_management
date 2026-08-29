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
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.Username == username && !n.IsDeleted);

        public async Task<NhanVien?> GetByEmailAsync(string email)
            => await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.Email == email && !n.IsDeleted);

        public async Task<bool> IsUsernameExistAsync(string username)
            => await _dbSet
                .AsNoTracking()
                .AnyAsync(n => n.Username == username && !n.IsDeleted);

        public async Task<IReadOnlyList<NhanVien>> GetActiveDoctorsAsync()
            => await _dbSet
                .AsNoTracking()
                .Where(n => n.IsActive && !n.IsDeleted && n.ChuyenKhoa != null)
                .ToListAsync();
        public async Task<List<VaiTro>> GetRolesByUserIdAsync(int userId)
            => await _context.Set<NhanVienVaiTro>()
                .AsNoTracking()
                .Where(nvvt => nvvt.MaNhanVien == userId)
                .Select(nvvt => nvvt.VaiTro)
                .Where(vt => vt != null)
                .ToListAsync()!;

        public async Task<List<Quyen>> GetPermissionsByUserIdAsync(int userId)
            => await _context.Set<NhanVienVaiTro>()
                .AsNoTracking()
                .Where(nvvt => nvvt.MaNhanVien == userId)
                .SelectMany(nvvt => nvvt.VaiTro!.VaiTroQuyens)
                .Select(vtq => vtq.Quyen)
                .Where(q => q != null)
                .Distinct()
                .ToListAsync()!;
       
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
                .Where(nv => nv.MaChucVu == 4) // Bác sĩ
                .Where(nv => nv.IsActive && !nv.IsDeleted)
                .Where(nv => nv.NhanVienKhoa.Any(nvk =>
                    nvk.MaKhoa == maKhoa &&
                    nvk.TuNgay <= today &&
                    (nvk.DenNgay == null || nvk.DenNgay >= today)
                ))
                .Where(nv => nv.PhanQuyenCoSo.Any(pq =>
                    pq.MaCoSo == maCoSo
                ))
                .Where(nv => nhanVienIdsWithLichLam.Contains(nv.Id)) // Chỉ lấy nhân viên có lịch làm việc
                .ToListAsync(cancellationToken);
        }
            
    
    }
}
