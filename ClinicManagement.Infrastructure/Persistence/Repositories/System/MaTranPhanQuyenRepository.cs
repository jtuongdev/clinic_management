using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories.System;

public sealed class MaTranPhanQuyenRepository(ClinicDbContext context) : IMaTranPhanQuyenRepository
{
    public async Task<IReadOnlyList<MaTranPhanQuyen>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Set<MaTranPhanQuyen>().AsNoTracking().OrderBy(x => x.MaVaiTro).ThenBy(x => x.PhanHe)
            .ThenBy(x => x.HanhDong).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<MaTranPhanQuyen>> GetByMaVaiTroIdsAsync(
        IReadOnlyCollection<int> maVaiTroIds,
        CancellationToken cancellationToken = default)
        => maVaiTroIds.Count == 0
            ? []
            : await context.Set<MaTranPhanQuyen>().AsNoTracking()
                .Where(x => maVaiTroIds.Contains(x.MaVaiTro) && x.DuocPhep)
                .ToListAsync(cancellationToken);

    public async Task ReplaceRoleAsync(
        int maVaiTro,
        IReadOnlyDictionary<string, IReadOnlyCollection<HanhDongQuyen>> phanQuyen,
        PhamViDuLieu phamViDuLieu,
        CancellationToken cancellationToken = default)
    {
        var existing = await context.Set<MaTranPhanQuyen>()
            .Where(x => x.MaVaiTro == maVaiTro).ToListAsync(cancellationToken);
        context.Set<MaTranPhanQuyen>().RemoveRange(existing);

        var rows = phanQuyen
            .Where(x => !string.IsNullOrWhiteSpace(x.Key))
            .SelectMany(module => module.Value.Distinct().Select(action => new MaTranPhanQuyen
            {
                MaVaiTro = maVaiTro,
                PhanHe = module.Key.Trim().ToLowerInvariant(),
                HanhDong = action,
                PhamViDuLieu = phamViDuLieu,
                DuocPhep = true
            }));

        await context.Set<MaTranPhanQuyen>().AddRangeAsync(rows, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
