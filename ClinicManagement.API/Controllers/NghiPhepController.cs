using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Application.Features.LichLamViec;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NghiPhepController : BaseController
    {
        private readonly IMediator mediator;
        public NghiPhepController(IMediator mediator) => this.mediator = mediator;

        [HttpGet]
        public async Task<IActionResult> Get(DateTime fromDate, DateTime toDate, int? maNhanVien = null, string? trangThai = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GetNghiPhepQuery(fromDate, toDate, maNhanVien, trangThai), cancellationToken));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNghiPhepRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CreateNghiPhepCommand(request), cancellationToken), "Tạo đơn nghỉ phép thành công.");

        [HttpPost("{id:int}/review")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Review(int id, [FromBody] ReviewNghiPhepRequest request, [FromQuery] bool approved, CancellationToken cancellationToken)
            => Success(await mediator.Send(new ReviewNghiPhepCommand(id, CurrentUserId, approved, request.GhiChu), cancellationToken), "Đã xử lý đơn nghỉ phép.");

        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CancelNghiPhepCommand(id), cancellationToken), "Đã hủy đơn nghỉ phép.");
    }
}