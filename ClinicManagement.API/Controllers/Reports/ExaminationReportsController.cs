using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.API.Authorization;
using ClinicManagement.Application.Features.ThongKe.Queries.LayBaoCaoLamSang;
using ClinicManagement.Application.Features.ThongKe.Queries.XuatBaoCaoLamSang;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Controller cung cấp API Báo cáo & Thống kê Lâm sàng (route /examination/reports)
/// </summary>
[ApiController]
[Route("api/examination/reports")]
[ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed class ExaminationReportsController : BaseController
{
    private readonly IMediator _mediator;

    public ExaminationReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy dữ liệu báo cáo thống kê lâm sàng (KPIs, biểu đồ doanh thu theo khoa, xếp hạng hiệu suất bác sĩ)
    /// </summary>
    /// <param name="facilityId">Mã cơ sở (tùy chọn)</param>
    /// <param name="departmentId">Mã khoa (tùy chọn)</param>
    /// <param name="fromDate">Từ ngày</param>
    /// <param name="toDate">Đến ngày</param>
    /// <param name="shift">Ca trực</param>
    /// <param name="cancellationToken"></param>
    [HttpGet]
    public async Task<IActionResult> GetReports(
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? shift = null,
        CancellationToken cancellationToken = default)
    {
        var query = new LayBaoCaoLamSangQuery
        {
            FacilityId = facilityId,
            DepartmentId = departmentId,
            FromDate = fromDate,
            ToDate = toDate,
            Shift = shift
        };

        var result = await _mediator.Send(query, cancellationToken);
        return Success(result);
    }

    /// <summary>
    /// Xuất file báo cáo & thống kê lâm sàng (CSV / Excel có hỗ trợ UTF-8 tiếng Việt chuẩn)
    /// </summary>
    /// <param name="facilityId">Mã cơ sở (tùy chọn)</param>
    /// <param name="departmentId">Mã khoa (tùy chọn)</param>
    /// <param name="fromDate">Từ ngày</param>
    /// <param name="toDate">Đến ngày</param>
    /// <param name="shift">Ca trực</param>
    /// <param name="format">Định dạng file (mặc định csv)</param>
    /// <param name="cancellationToken"></param>
    [HttpGet("export")]
    public async Task<IActionResult> ExportReports(
        [FromQuery] int? facilityId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? shift = null,
        [FromQuery] string format = "csv",
        CancellationToken cancellationToken = default)
    {
        var query = new XuatBaoCaoLamSangQuery
        {
            FacilityId = facilityId,
            DepartmentId = departmentId,
            FromDate = fromDate,
            ToDate = toDate,
            Shift = shift,
            Format = format
        };

        var fileResult = await _mediator.Send(query, cancellationToken);
        return File(fileResult.FileContent, fileResult.ContentType, fileResult.FileName);
    }
}
