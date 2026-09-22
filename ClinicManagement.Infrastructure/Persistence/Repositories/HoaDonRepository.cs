using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories;

public sealed class HoaDonRepository(ClinicDbContext context) : IHoaDonRepository
{
    private IQueryable<HoaDon> WithDetails()
        => context.HoaDons
            .Include(h => h.BenhNhan)
            .Include(h => h.ChiTietHoaDons)
            .Include(h => h.PhieuThus)
                .ThenInclude(p => p.NguoiThu)
            .Include(h => h.CongNoBenhNhan);

    public Task<HoaDon?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => WithDetails().SingleOrDefaultAsync(h => h.Id == id, cancellationToken);

    public Task<HoaDon?> GetBySoHoaDonAsync(
        string soHoaDon, CancellationToken cancellationToken = default)
        => WithDetails().SingleOrDefaultAsync(h => h.SoHoaDon == soHoaDon, cancellationToken);

    public Task<HoaDon?> GetByLuotKhamAsync(
        int maLuotKham, CancellationToken cancellationToken = default)
        => WithDetails()
            .Where(h => h.MaLuotKham == maLuotKham && h.TrangThai != TrangThaiHoaDon.DA_HUY)
            .OrderByDescending(h => h.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<(IReadOnlyList<HoaDon> Items, int TotalCount)> GetByCoSoAsync(
        int maCoSo,
        DateTime? fromDate,
        DateTime? toDate,
        TrangThaiHoaDon? trangThai,
        string? keyword,
        int pageIndex,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = WithDetails().AsQueryable();
        if (maCoSo > 0)
            query = query.Where(h => h.MaCoSo == maCoSo);
        if (fromDate.HasValue)
            query = query.Where(h => h.NgayLap >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(h => h.NgayLap < toDate.Value.AddDays(1));
        if (trangThai.HasValue)
            query = query.Where(h => h.TrangThai == trangThai.Value);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim().ToLower();
            query = query.Where(h =>
                h.SoHoaDon.ToLower().Contains(kw) ||
                (h.BenhNhan != null && ((h.BenhNhan.Ho + " " + h.BenhNhan.Ten).ToLower().Contains(kw) || h.BenhNhan.DienThoai.Contains(kw) || h.BenhNhan.SoCCCD.Contains(kw))) ||
                h.MaBenhNhan.ToString().Contains(kw) ||
                h.MaLuotKham.ToString().Contains(kw));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(h => h.NgayLap)
            .Skip((Math.Max(pageIndex, 1) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<IReadOnlyList<CongNoBenhNhan>> GetCongNoByBenhNhanAsync(
        int maBenhNhan, CancellationToken cancellationToken = default)
        => await context.CongNoBenhNhans
            .Include(c => c.HoaDon)
            .Where(c => c.MaBenhNhan == maBenhNhan &&
                        c.SoTienNo > c.SoTienDaTra)
            .OrderBy(c => c.HanThanhToan)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CongNoBenhNhan>> GetCongNoQuaHanAsync(
        int maCoSo, CancellationToken cancellationToken = default)
    {
        var query = context.CongNoBenhNhans
            .Include(c => c.HoaDon)
            .Where(c => c.SoTienNo > c.SoTienDaTra &&
                        c.HanThanhToan.HasValue &&
                        c.HanThanhToan.Value < DateTime.UtcNow);

        if (maCoSo > 0)
            query = query.Where(c => c.HoaDon.MaCoSo == maCoSo);

        return await query
            .OrderBy(c => c.HanThanhToan)
            .ToListAsync(cancellationToken);
    }

    public Task AddAsync(HoaDon hoaDon, CancellationToken cancellationToken = default)
        => context.HoaDons.AddAsync(hoaDon, cancellationToken).AsTask();

    public void Update(HoaDon hoaDon) => context.HoaDons.Update(hoaDon);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => context.SaveChangesAsync(cancellationToken);
}
