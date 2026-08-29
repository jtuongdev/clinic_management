using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetLuotKhamStatsQueryHandler
        : IRequestHandler<GetLuotKhamStatsQuery, LuotKhamStatsDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public GetLuotKhamStatsQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<LuotKhamStatsDto> Handle(
            GetLuotKhamStatsQuery request,
            CancellationToken cancellationToken)
        {
            // Lấy dữ liệu có Include Khoa
            var all = await _luotKhamRepo.GetAllWithIncludesAsync(cancellationToken);

            // Lọc theo cơ sở và khoa nếu có
            var query = all.Where(l => !l.IsDeleted);
            if (request.MaCoSo.HasValue)
                query = query.Where(l => l.MaCoSo == request.MaCoSo.Value);
            if (request.MaKhoa.HasValue)
                query = query.Where(l => l.MaKhoa == request.MaKhoa.Value);

            var list = query.ToList();

            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var dto = new LuotKhamStatsDto
            {
                TongLuotKham = list.Count,
                HomNay = list.Count(l => l.NgayKham.Date == today),
                TuanNay = list.Count(l => l.NgayKham.Date >= startOfWeek && l.NgayKham.Date <= today),
                ThangNay = list.Count(l => l.NgayKham.Date >= startOfMonth && l.NgayKham.Date <= today),
                TheoTrangThai = list
                    .GroupBy(l => l.TrangThai.ToString())
                    .Select(g => new TrangThaiCountDto { TrangThai = g.Key, SoLuong = g.Count() })
                    .ToList(),
                TheoKhoa = list
                    .GroupBy(l => new { l.MaKhoa, TenKhoa = l.Khoa?.Ten ?? "Không xác định" })
                    .Select(g => new KhoaCountDto
                    {
                        MaKhoa = g.Key.MaKhoa,
                        TenKhoa = g.Key.TenKhoa,
                        SoLuong = g.Count()
                    })
                    .OrderByDescending(d => d.SoLuong)
                    .ToList()
            };

            return dto;
        }

    }
}