using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.SystemReports;
using ClinicManagement.Application.Features.ThongKe.Queries.LayBaoCaoLamSang;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemClinicalReport;

public sealed class GetSystemClinicalReportQueryHandler(
    IMediator mediator,
    ILuotKhamRepository luotKhamRepo)
    : IRequestHandler<GetSystemClinicalReportQuery, SystemReportsClinicalDto>
{
    public async Task<SystemReportsClinicalDto> Handle(
        GetSystemClinicalReportQuery request,
        CancellationToken cancellationToken)
    {
        var from = (request.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var to = (request.ToDate ?? DateTime.UtcNow).Date.AddDays(1);

        // 1. Lấy báo cáo lâm sàng chuẩn qua Query đã có
        var baseReport = await mediator.Send(new LayBaoCaoLamSangQuery
        {
            FacilityId = request.FacilityId,
            DepartmentId = request.DepartmentId,
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            Shift = request.Shift
        }, cancellationToken);

        // 2. Query cơ sở lượt khám theo bộ lọc
        var visitQuery = luotKhamRepo.GetQueryable().AsNoTracking()
            .Where(v => v.NgayKham >= from && v.NgayKham < to);

        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
            visitQuery = visitQuery.Where(v => v.MaCoSo == request.FacilityId.Value);
        if (request.DepartmentId.HasValue && request.DepartmentId.Value > 0)
            visitQuery = visitQuery.Where(v => v.MaKhoa == request.DepartmentId.Value);

        // 3. Thống kê Top 10 mã bệnh ICD-10
        var topIcd = await visitQuery
            .SelectMany(v => v.ChanDoans)
            .Where(cd => cd.ICD != null)
            .GroupBy(cd => new { cd.ICD!.MaICD, cd.ICD.TenICD })
            .Select(g => new TopDiagnosisDto
            {
                Code = g.Key.MaICD,
                Name = g.Key.TenICD,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync(cancellationToken);

        // 4. Thống kê Chỉ định Cận lâm sàng theo nhóm
        var clsBreakdown = await visitQuery
            .SelectMany(v => v.ChiDinhDichVus)
            .Where(c => c.NgayChiDinh >= from && c.NgayChiDinh < to && c.DanhMucDichVu != null)
            .GroupBy(c => c.DanhMucDichVu!.LoaiDichVu.ToString())
            .Select(g => new ClsBreakdownDto
            {
                Type = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(x => x.DanhMucDichVu!.Gia)
            })
            .ToListAsync(cancellationToken);

        return new SystemReportsClinicalDto
        {
            BaseReport = baseReport,
            TopDiagnoses = topIcd,
            ClsBreakdown = clsBreakdown
        };
    }
}
