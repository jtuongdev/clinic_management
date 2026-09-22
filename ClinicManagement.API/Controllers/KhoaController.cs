using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.Features.Khoa.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public class KhoaController : BaseController
{
    private readonly IMediator _mediator;

    public KhoaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] int maCoSo,
        CancellationToken cancellationToken)
    {
        int effectiveMaCoSo = maCoSo <= 0 ? 1 : maCoSo;

        var result = await _mediator.Send(
            new LayDanhSachKhoaDropdownQuery
            {
                MaCoSo = effectiveMaCoSo
            },
            cancellationToken);

        return Success(result, "Lấy danh sách khoa thành công");
    }

    [HttpGet("overview")]
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