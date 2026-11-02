using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.SystemReports;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemProductivityReport;

public sealed class GetSystemProductivityReportQueryHandler(ILuotKhamRepository luotKhamRepo)
    : IRequestHandler<GetSystemProductivityReportQuery, SystemReportsProductivityDto>
{
    public async Task<SystemReportsProductivityDto> Handle(
        GetSystemProductivityReportQuery request,
        CancellationToken cancellationToken)
    {
        var from = (request.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var to = (request.ToDate ?? DateTime.UtcNow).Date.AddDays(1);

        var query = luotKhamRepo.GetQueryable().AsNoTracking()
            .Where(v => v.NgayKham >= from && v.NgayKham < to && v.MaBacSi.HasValue);

        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
            query = query.Where(v => v.MaCoSo == request.FacilityId.Value);
        if (request.DepartmentId.HasValue && request.DepartmentId.Value > 0)
            query = query.Where(v => v.MaKhoa == request.DepartmentId.Value);

        var doctorStats = await query
            .GroupBy(v => new { v.MaBacSi, v.BacSi!.HoTen, Department = v.Khoa.Ten })
            .Select(g => new DoctorProductivityDto
            {
                DoctorId = g.Key.MaBacSi!.Value,
                DoctorName = g.Key.HoTen,
                Department = g.Key.Department,
                TotalVisits = g.Count(),
                CompletedVisits = g.Count(x => x.TrangThai == TrangThaiLuotKham.HOAN_THANH),
                PrescriptionsCount = g.SelectMany(x => x.DonThuocs).Count(),
                ClsOrdersCount = g.SelectMany(x => x.ChiDinhDichVus).Count(),
                RevenueGenerated = g.SelectMany(x => x.HoaDons).Sum(h => (decimal?)h.TongTien) ?? 0
            })
            .OrderByDescending(x => x.TotalVisits)
            .ToListAsync(cancellationToken);

        var roomStats = await query
            .Where(v => v.MaPhongKham.HasValue && v.PhongKham != null)
            .GroupBy(v => new { v.MaPhongKham, v.PhongKham!.Ten, Department = v.Khoa.Ten })
            .Select(g => new RoomUtilizationDto
            {
                RoomId = g.Key.MaPhongKham!.Value,
                RoomName = g.Key.Ten,
                Department = g.Key.Department,
                VisitsCount = g.Count()
            })
            .OrderByDescending(x => x.VisitsCount)
            .Take(10)
            .ToListAsync(cancellationToken);

        return new SystemReportsProductivityDto
        {
            DoctorRankings = doctorStats,
            RoomUtilization = roomStats
        };
    }
}
