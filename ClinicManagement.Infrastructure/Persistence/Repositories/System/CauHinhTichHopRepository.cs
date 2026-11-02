using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories.System
{
    public sealed class CauHinhTichHopRepository(ClinicDbContext context) : ICauHinhTichHopRepository
    {
        private readonly ClinicDbContext _context = context;

        public async Task<IReadOnlyList<CauHinhTichHop>> GetByCategoryAsync(string? danhMuc = null, CancellationToken cancellationToken = default)
        {
            var query = _context.CauHinhTichHops.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(danhMuc))
                query = query.Where(x => x.DanhMuc.ToLower() == danhMuc.Trim().ToLower());

            return await query
                .OrderBy(x => x.DanhMuc)
                .ThenBy(x => x.MaCode)
                .ToListAsync(cancellationToken);
        }

        public async Task<CauHinhTichHop?> GetByDanhMucAndCodeAsync(string danhMuc, string maCode, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(danhMuc) || string.IsNullOrWhiteSpace(maCode))
                return null;

            return await _context.CauHinhTichHops
                .FirstOrDefaultAsync(x => x.DanhMuc.ToLower() == danhMuc.Trim().ToLower()
                    && x.MaCode.ToLower() == maCode.Trim().ToLower(), cancellationToken);
        }

        public async Task<CauHinhTichHop> UpsertAsync(CauHinhTichHop entity, CancellationToken cancellationToken = default)
        {
            if (entity is null)
                throw new ArgumentNullException(nameof(entity));

            var existing = await GetByDanhMucAndCodeAsync(entity.DanhMuc, entity.MaCode, cancellationToken);
            if (existing is null)
            {
                await _context.CauHinhTichHops.AddAsync(entity, cancellationToken);
            }
            else
            {
                existing.DanhMuc = entity.DanhMuc;
                existing.MaCode = entity.MaCode;
                existing.Ten = entity.Ten;
                existing.GiaTri = entity.GiaTri;
                existing.MoTa = entity.MoTa;
                existing.DaMaHoa = entity.DaMaHoa;
                existing.NguoiCapNhat = entity.NguoiCapNhat;
                existing.ThoiGianCapNhat = entity.ThoiGianCapNhat;
                _context.CauHinhTichHops.Update(existing);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return existing ?? entity;
        }
    }
}
