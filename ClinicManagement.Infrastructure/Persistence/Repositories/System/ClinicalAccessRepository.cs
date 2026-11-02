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

        public async Task<Domain.Identity.VaiTro> CreateRoleAsync(string tenVaiTro, string? moTa, CancellationToken cancellationToken = default)
        {
            var role = new Domain.Identity.VaiTro
            {
                TenVaiTro = tenVaiTro.Trim(),
                MoTa = moTa?.Trim() ?? string.Empty
            };
            await _context.VaiTros.AddAsync(role, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return role;
        }

        public async Task<bool> DeleteRoleAsync(int roleId, CancellationToken cancellationToken = default)
        {
            var role = await _context.VaiTros.FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken);
            if (role == null) return false;

            var userRoles = await _context.NhanVienVaiTros.Where(x => x.MaVaiTro == roleId).ToListAsync(cancellationToken);
            if (userRoles.Count > 0)
            {
                _context.NhanVienVaiTros.RemoveRange(userRoles);
            }

            _context.VaiTros.Remove(role);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> IsRoleAssignedToUsersAsync(int roleId, CancellationToken cancellationToken = default)
        {
            return await _context.NhanVienVaiTros.AnyAsync(
                x => x.MaVaiTro == roleId && (!x.NgayKetThuc.HasValue || x.NgayKetThuc.Value > DateTime.UtcNow),
                cancellationToken);
        }

        public async Task<Domain.Identity.VaiTro?> GetRoleByIdAsync(int roleId, CancellationToken cancellationToken = default)
        {
            return await _context.VaiTros.FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken);
        }
    }
}
