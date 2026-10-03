using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.Features.Khoa.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KhoaController : BaseController
{
    private readonly IMediator _mediator;

    public KhoaController(IMediator mediator)
    {
        _mediator = mediator;
    }

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