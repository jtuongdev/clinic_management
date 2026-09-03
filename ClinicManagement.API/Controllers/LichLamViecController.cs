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
    [Authorize(Roles = "Admin")]
    public class LichLamViecController : BaseController
    {
        private readonly IMediator mediator;
        public LichLamViecController(IMediator mediator) => this.mediator = mediator;

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] int? maNhanVien = null,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetLichLamViecQuery(fromDate, toDate, maNhanVien), cancellationToken);
            return Success(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLichLamViecRequest request, CancellationToken cancellationToken)
        {
            var result = await mediator.Send(new CreateLichLamViecCommand(request), cancellationToken);
            return CreatedAtAction(nameof(Get), new { fromDate = result.NgayLam, toDate = result.NgayLam }, ApiResponse<object>.Ok(result, "Tạo lịch làm việc thành công."));
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] BulkScheduleRequest request, CancellationToken cancellationToken)
        {
            var result = await mediator.Send(new BulkScheduleCommand(request), cancellationToken);
            return Success(result, "Đã xử lý tạo lịch hàng loạt.");
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLichLamViecRequest request, CancellationToken cancellationToken)
        {
            var result = await mediator.Send(new UpdateLichLamViecCommand(id, request), cancellationToken);
            return Success(result, "Cập nhật lịch làm việc thành công.");
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new DeleteLichLamViecCommand(id, CurrentUserId), cancellationToken);
            return Success<object>(null, "Xóa lịch làm việc thành công.");
        }
    }
}