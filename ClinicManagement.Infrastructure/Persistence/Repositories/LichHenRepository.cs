using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class LichHenRepository : Repository<LichHen>, ILichHenRepository
    {
        public LichHenRepository(ClinicDbContext context) : base(context)
        {
        }

        public async Task<LichHen?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.LichHens
                .Include(lh => lh.BenhNhan)
                    .ThenInclude(bn => bn.BenhNhanCoSo)
                .Include(lh => lh.BacSi)
                .Include(lh => lh.CoSo)
                .Include(lh => lh.Khoa)
                .FirstOrDefaultAsync(lh => lh.Id == id && !lh.IsDeleted, cancellationToken);
        }

        public async Task<(IReadOnlyList<LichHen> Items, int TotalCount)> GetPagedAppointmentsAsync(
            int? maCoSo,
            int? maBacSi,
            DateTime? tuNgay,
            DateTime? denNgay,
            string? trangThai,
            string? keyword,
            int pageIndex,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            var query = _context.LichHens
                .AsNoTracking()
                .Include(lh => lh.BenhNhan)
                .Include(lh => lh.BacSi)
                .Include(lh => lh.CoSo)
                .Include(lh => lh.Khoa)
                .Where(lh => !lh.IsDeleted);

            if (maCoSo.HasValue && maCoSo.Value > 0)
            {
                query = query.Where(lh => lh.MaCoSo == maCoSo.Value);
            }

            if (maBacSi.HasValue && maBacSi.Value > 0)
            {
                query = query.Where(lh => lh.MaBacSi == maBacSi.Value);
            }

            if (tuNgay.HasValue)
            {
                var start = tuNgay.Value.Date;
                query = query.Where(lh => lh.ThoiGianBatDau >= start);
            }

            if (denNgay.HasValue)
            {
                var end = denNgay.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(lh => lh.ThoiGianBatDau <= end);
            }

            if (!string.IsNullOrWhiteSpace(trangThai) && Enum.TryParse<TrangThaiLichHen>(trangThai, true, out var parsedStatus))
            {
                query = query.Where(lh => lh.TrangThai == parsedStatus);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim().ToLower();
                query = query.Where(lh =>
                    lh.BenhNhan.Ho.ToLower().Contains(kw) ||
                    lh.BenhNhan.Ten.ToLower().Contains(kw) ||
                    lh.BenhNhan.DienThoai.Contains(kw) ||
                    lh.BenhNhan.SoCCCD.Contains(kw) ||
                    lh.BacSi.HoTen.ToLower().Contains(kw) ||
                    (lh.SoPhieuThu != null && lh.SoPhieuThu.ToLower().Contains(kw))
                );
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(lh => lh.ThoiGianBatDau)
                .ThenBy(lh => lh.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public async Task<int> CountAppointmentsInSlotAsync(
            int maBacSi,
            DateTime startTime,
            DateTime endTime,
            int? excludeId = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.LichHens
                .AsNoTracking()
                .Where(lh => !lh.IsDeleted
                    && lh.MaBacSi == maBacSi
                    && lh.TrangThai != TrangThaiLichHen.DA_HUY
                    && lh.ThoiGianBatDau < endTime
                    && lh.ThoiGianKetThuc > startTime);

            if (excludeId.HasValue && excludeId.Value > 0)
            {
                query = query.Where(lh => lh.Id != excludeId.Value);
            }

            return await query.CountAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<LichHen>> GetAppointmentsByDoctorAndDateAsync(
            int maBacSi,
            DateTime date,
            CancellationToken cancellationToken = default)
        {
            var start = date.Date;
            var end = date.Date.AddDays(1).AddTicks(-1);

            return await _context.LichHens
                .AsNoTracking()
                .Include(lh => lh.BenhNhan)
                .Where(lh => !lh.IsDeleted
                    && lh.MaBacSi == maBacSi
                    && lh.TrangThai != TrangThaiLichHen.DA_HUY
                    && lh.ThoiGianBatDau >= start
                    && lh.ThoiGianBatDau <= end)
                .OrderBy(lh => lh.ThoiGianBatDau)
                .ToListAsync(cancellationToken);
        }
    }
}
