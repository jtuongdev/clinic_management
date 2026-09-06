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
    public class ChamCongController : BaseController
    {
        private readonly IMediator mediator;
        public ChamCongController(IMediator mediator) => this.mediator = mediator;

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Get(DateTime fromDate, DateTime toDate, int? maNhanVien = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GetChamCongQuery(fromDate, toDate, maNhanVien), cancellationToken));

        [HttpGet("kpi-summary")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetKpiSummary(
            DateTime fromDate, DateTime toDate, int? maKhoa = null, int? maNhanVien = null,
            CancellationToken cancellationToken = default)
            => Success(await mediator.Send(
                new GetChamCongKpiSummaryQuery(fromDate, toDate, maKhoa, maNhanVien), cancellationToken));

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CheckInCommand(request.MaLichLamViec), cancellationToken), "Check-in thành công.");

        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CheckOutCommand(request.MaLichLamViec), cancellationToken), "Check-out thành công.");

        [HttpPost("finalize-absent")]
        public async Task<IActionResult> FinalizeAbsent(CancellationToken cancellationToken)
            => Success(await mediator.Send(new FinalizeAbsentAttendanceCommand(), cancellationToken), "Đã chốt các ca vắng mặt.");

        [HttpGet("adjustments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdjustments(DateTime? fromDate = null, DateTime? toDate = null, string? status = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GetAttendanceAdjustmentsQuery(fromDate, toDate, status), cancellationToken));

        [HttpPost("adjustments")]
        public async Task<IActionResult> RequestAdjustment([FromBody] AttendanceAdjustmentRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CreateAttendanceAdjustmentCommand(request, CurrentUserId), cancellationToken), "Đã gửi yêu cầu điều chỉnh.");

        [HttpPost("adjustments/{id:int}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveAdjustment(int id, [FromBody] ReviewAttendanceAdjustmentRequest? request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new ReviewAttendanceAdjustmentCommand(id, CurrentUserId, true, request?.GhiChu), cancellationToken), "Đã duyệt điều chỉnh.");

        [HttpPost("adjustments/{id:int}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectAdjustment(int id, [FromBody] ReviewAttendanceAdjustmentRequest? request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new ReviewAttendanceAdjustmentCommand(id, CurrentUserId, false, request?.GhiChu), cancellationToken), "Đã từ chối điều chỉnh.");

        [HttpGet("periods")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPeriods(CancellationToken cancellationToken)
            => Success(await mediator.Send(new GetAttendancePeriodsQuery(), cancellationToken));

        [HttpPost("periods")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePeriod([FromBody] CreateAttendancePeriodRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CreateAttendancePeriodCommand(request), cancellationToken), "Đã tạo kỳ chấm công.");

        [HttpPost("periods/{id:int}/lock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> LockPeriod(int id, CancellationToken cancellationToken)
            => Success(await mediator.Send(new LockAttendancePeriodCommand(id, CurrentUserId, true), cancellationToken), "Đã khóa kỳ chấm công.");

        [HttpPost("periods/{id:int}/unlock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnlockPeriod(int id, CancellationToken cancellationToken)
            => Success(await mediator.Send(new LockAttendancePeriodCommand(id, CurrentUserId, false), cancellationToken), "Đã mở khóa kỳ chấm công.");
    }
}