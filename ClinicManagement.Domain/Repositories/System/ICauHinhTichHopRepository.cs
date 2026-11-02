using ClinicManagement.Domain.System;

namespace ClinicManagement.Domain.Repositories.System
{
    public interface ICauHinhTichHopRepository
    {
        Task<IReadOnlyList<CauHinhTichHop>> GetByCategoryAsync(string? danhMuc = null, CancellationToken cancellationToken = default);
        Task<CauHinhTichHop?> GetByDanhMucAndCodeAsync(string danhMuc, string maCode, CancellationToken cancellationToken = default);
        Task<CauHinhTichHop> UpsertAsync(CauHinhTichHop entity, CancellationToken cancellationToken = default);
    }
}
