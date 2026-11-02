using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.Features.Khoa.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Chuyên khoa (Departments) - Quản lý Khoa/Phòng chuyên môn
/// Route: api/Khoa, api/departments
/// </summary>
[ApiController]
[Route("api/Khoa")]
[Route("api/departments")]
[Authorize]
public class KhoaController : BaseController
{
    private readonly IMediator _mediator;

    public KhoaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy danh sách chuyên khoa phục vụ chọn lựa (Dropdown)
    /// </summary>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] int? maCoSo = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new LayDanhSachKhoaDropdownQuery
            {
                MaCoSo = maCoSo
            },
            cancellationToken);

        return Success(result, "Lấy danh sách khoa thành công");
    }

    /// <summary>
    /// Lấy dữ liệu tổng quan hoạt động và nhân sự của khoa
    /// </summary>
    [HttpGet("overview")]
    [ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> GetOverview(
        [FromQuery] int? maCoSo = null,
        CancellationToken cancellationToken = default)
    {
        var query = new LayTongQuanKhoaQuery
        {
            MaCoSo = maCoSo
        };

        var result = await _mediator.Send(query, cancellationToken);
        return Success(result, "Lấy dữ liệu tổng quan khoa thành công");
    }
}