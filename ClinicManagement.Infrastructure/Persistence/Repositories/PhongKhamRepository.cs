using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HospitalApi.Contracts.Common.Contracts;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class PhongKhamRepository : Repository<PhongKham>, IPhongKhamRepository
    {
        public PhongKhamRepository(ClinicDbContext context) : base(context) { }

        public async Task<IEnumerable<PhongKham>> GetByKhoaAsync(int maKhoa)
        {
            return await _context.PhongKhams
                .AsNoTracking()
                .Where(p => p.MaKhoa == maKhoa 
                    && (p.TrangThai == "HOAT_DONG" || p.TrangThai == "HoatDong" || p.TrangThai == "Hoạt động") 
                    && !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<IEnumerable<PhongKham>> GetByNhanVienAsync(int maNhanVien)
        {
            var maKhoas = await _context.NhanVienKhoas
                .AsNoTracking()
                .Where(nk => nk.MaNhanVien == maNhanVien && nk.DenNgay == null && !nk.IsDeleted)
                .Select(nk => nk.MaKhoa)
                .Distinct()
                .ToListAsync();

            if (!maKhoas.Any())
                return new List<PhongKham>();

            return await _context.PhongKhams
                .AsNoTracking()
                .Include(p => p.Khoa)
                .Where(p => maKhoas.Contains(p.MaKhoa) && !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<IEnumerable<PhongKham>> GetByCoSoAsync(int maCoSo)
        {
            return await _context.PhongKhams
                .AsNoTracking()
                .Include(p => p.Khoa)
                .Where(p => p.Khoa.MaCoSo == maCoSo && !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<IEnumerable<PhongKham>> GetActiveAsync(int? maKhoa = null)
        {
            var query = _context.PhongKhams
                .AsNoTracking()
                .Where(p => (p.TrangThai == "HOAT_DONG" || p.TrangThai == "HoatDong" || p.TrangThai == "Hoạt động") && !p.IsDeleted);

            if (maKhoa.HasValue)
                query = query.Where(p => p.MaKhoa == maKhoa.Value);

            return await query
                .Include(p => p.Khoa)
                .ToListAsync();
        }
    }
}