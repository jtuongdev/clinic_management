using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Repositories;

public interface IHoaDonRepository
{
    Task<HoaDon?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<HoaDon?> GetBySoHoaDonAsync(string soHoaDon, CancellationToken cancellationToken = default);
    Task<HoaDon?> GetByLuotKhamAsync(int maLuotKham, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<HoaDon> Items, int TotalCount)> GetByCoSoAsync(
        int maCoSo,
        DateTime? fromDate,
        DateTime? toDate,
        TrangThaiHoaDon? trangThai,
        string? keyword,
        int pageIndex,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CongNoBenhNhan>> GetCongNoByBenhNhanAsync(
        int maBenhNhan, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CongNoBenhNhan>> GetCongNoQuaHanAsync(
        int maCoSo, CancellationToken cancellationToken = default);
    Task AddAsync(HoaDon hoaDon, CancellationToken cancellationToken = default);
    void Update(HoaDon hoaDon);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}