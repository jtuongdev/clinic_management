using ClinicManagement.Domain.System;

namespace ClinicManagement.Domain.Repositories.System
{
    public interface INhatKyHoSoBenhAnRepository
    {
        Task<IReadOnlyList<NhatKyHoSoBenhAn>> GetByFilterAsync(
            int? maBenhNhan = null,
            int? maNguoiDung = null,
            string? hanhDong = null,
            string? phanHe = null,
            DateTime? from = null,
            DateTime? to = null,
            int pageIndex = 1,
            int pageSize = 20,
            CancellationToken cancellationToken = default);

        Task<NhatKyHoSoBenhAn> AddAsync(NhatKyHoSoBenhAn entity, CancellationToken cancellationToken = default);
    }
}
