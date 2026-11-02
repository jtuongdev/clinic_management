using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories.System
{
    public sealed class NhatKyHoSoBenhAnRepository(ClinicDbContext context) : INhatKyHoSoBenhAnRepository
    {
        private readonly ClinicDbContext _context = context;

        public async Task<IReadOnlyList<NhatKyHoSoBenhAn>> GetByFilterAsync(
            int? maBenhNhan = null,
            int? maNguoiDung = null,
            string? hanhDong = null,
            string? phanHe = null,
            DateTime? from = null,
            DateTime? to = null,
            int pageIndex = 1,
            int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var query = _context.NhatKyHoSoBenhAns.AsNoTracking().AsQueryable();

            if (maBenhNhan.HasValue)
                query = query.Where(x => x.MaBenhNhan == maBenhNhan.Value);

            if (maNguoiDung.HasValue)
                query = query.Where(x => x.MaNguoiDung == maNguoiDung.Value);

            if (!string.IsNullOrWhiteSpace(hanhDong))
                query = query.Where(x => x.HanhDong.ToLower() == hanhDong.Trim().ToLower());
            if (!string.IsNullOrWhiteSpace(phanHe))
                query = query.Where(x => x.PhanHe.ToLower() == phanHe.Trim().ToLower());

            if (from.HasValue)
                query = query.Where(x => x.ThoiGian >= from.Value);

            if (to.HasValue)
                query = query.Where(x => x.ThoiGian <= to.Value);

            var safePage = Math.Max(1, pageIndex);
            var safeSize = Math.Clamp(pageSize, 1, 200);

            return await query
                .OrderByDescending(x => x.ThoiGian)
                .Skip((safePage - 1) * safeSize)
                .Take(safeSize)
                .ToListAsync(cancellationToken);
        }

        public async Task<NhatKyHoSoBenhAn> AddAsync(NhatKyHoSoBenhAn entity, CancellationToken cancellationToken = default)
        {
            if (entity is null)
                throw new ArgumentNullException(nameof(entity));

            await _context.NhatKyHoSoBenhAns.AddAsync(entity, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return entity;
        }
    }
}
