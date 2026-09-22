using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Domain.Repositories.System;

public interface IMaTranPhanQuyenRepository
{
    Task<IReadOnlyList<MaTranPhanQuyen>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaTranPhanQuyen>> GetByMaVaiTroIdsAsync(
        IReadOnlyCollection<int> maVaiTroIds,
        CancellationToken cancellationToken = default);
    Task ReplaceRoleAsync(
        int maVaiTro,
        IReadOnlyDictionary<string, IReadOnlyCollection<HanhDongQuyen>> phanQuyen,
        PhamViDuLieu phamViDuLieu,
        CancellationToken cancellationToken = default);
}
