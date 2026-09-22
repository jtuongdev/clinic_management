using ClinicManagement.Domain.Repositories.System;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories.System
{
    public sealed class ClinicalAccessRepository(ClinicDbContext context) : IClinicalAccessRepository
    {
        private readonly ClinicDbContext _context = context;

        public async Task<IReadOnlyList<int>> GetRoleIdsByUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            if (userId <= 0)
                return Array.Empty<int>();

            return await _context.NhanVienVaiTros
                .AsNoTracking()
                .Where(x => x.MaNhanVien == userId && (!x.NgayKetThuc.HasValue || x.NgayKetThuc.Value > DateTime.UtcNow))
                .Select(x => x.MaVaiTro)
                .Distinct()
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<string>> GetRoleNamesByUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            var roleIds = await GetRoleIdsByUserAsync(userId, cancellationToken);
            if (roleIds.Count == 0)
                return Array.Empty<string>();

            return await _context.VaiTros
                .AsNoTracking()
                .Where(x => roleIds.Contains(x.Id))
                .Select(x => x.TenVaiTro)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyDictionary<int, string>> GetRoleNamesByIdsAsync(
            IReadOnlyCollection<int> roleIds, CancellationToken cancellationToken = default)
            => await _context.VaiTros.AsNoTracking()
                .Where(x => roleIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, x => x.TenVaiTro, cancellationToken);
    }
}
