using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
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
    [ClinicalAuthorize("hr", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
    public class ChamCongController : BaseController
    {
        private readonly IMediator mediator;
        public ChamCongController(IMediator mediator) => this.mediator = mediator;

        [HttpGet]
        public async Task<IActionResult> Get(DateTime fromDate, DateTime toDate, int? maKhoa = null, int? maNhanVien = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new LayChamCongQuery(fromDate, toDate, maNhanVien, maKhoa), cancellationToken));

        [HttpGet("kpi-summary")]
        public async Task<IActionResult> GetKpiSummary(
            DateTime fromDate, DateTime toDate, int? maKhoa = null, int? maNhanVien = null,
            CancellationToken cancellationToken = default)
            => Success(await mediator.Send(
                new GetChamCongKpiSummaryQuery(fromDate, toDate, maKhoa, maNhanVien), cancellationToken));

        [HttpPost("check-in")]
        [AllowSelf]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request, CancellationToken cancellationToken)
        {
            var employeeId = request.MaNhanVien > 0 ? request.MaNhanVien : CurrentUserId;
            var result = await mediator.Send(new QuetVaoCommand(employeeId, request.ThoiGianQuet, request.GhiChu), cancellationToken);
            return Success(result, "Check-in thành công.");
        }

        [HttpPost("check-out")]
        [AllowSelf]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest request, CancellationToken cancellationToken)
        {
            var employeeId = request.MaNhanVien > 0 ? request.MaNhanVien : CurrentUserId;
            var result = await mediator.Send(new QuetRaCommand(employeeId, request.ThoiGianQuet, request.GhiChu), cancellationToken);
            return Success(result, "Check-out thành công.");
        }

        [HttpGet("my-attendance")]
        [AllowSelf]
        public async Task<IActionResult> GetMyAttendance([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null, CancellationToken cancellationToken = default)
        {
            var from = fromDate ?? DateTime.Today.AddDays(-30);
            var to = toDate ?? DateTime.Today.AddDays(7);
            var result = await mediator.Send(new LayChamCongQuery(from, to, CurrentUserId), cancellationToken);
            return Success(result);
        }

        [HttpGet("today-status")]
        [AllowSelf]
        public async Task<IActionResult> GetTodayStatus(CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GetDoctorTodayStatusQuery(CurrentUserId), cancellationToken));

        [HttpPost("finalize-absent")]
        public async Task<IActionResult> FinalizeAbsent(CancellationToken cancellationToken)
            => Success(await mediator.Send(new ChotVangMatCommand(), cancellationToken), "Đã chốt các ca vắng mặt.");

        [HttpGet("adjustments")]
        public async Task<IActionResult> GetAdjustments(DateTime? fromDate = null, DateTime? toDate = null, string? status = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new LayDieuChinhChamCongQuery(fromDate, toDate, status), cancellationToken));

        [HttpPost("adjustments")]
        public async Task<IActionResult> RequestAdjustment([FromBody] AttendanceAdjustmentRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new TaoDieuChinhChamCongCommand(request, CurrentUserId), cancellationToken), "Đã gửi yêu cầu điều chỉnh.");

        [HttpPost("adjustments/{id:int}/approve")]
        public async Task<IActionResult> ApproveAdjustment(int id, [FromBody] ReviewAttendanceAdjustmentRequest? request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new DuyetDieuChinhChamCongCommand(id, CurrentUserId, true, request?.GhiChu), cancellationToken), "Đã duyệt điều chỉnh.");

        [HttpPost("adjustments/{id:int}/reject")]
        public async Task<IActionResult> RejectAdjustment(int id, [FromBody] ReviewAttendanceAdjustmentRequest? request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new DuyetDieuChinhChamCongCommand(id, CurrentUserId, false, request?.GhiChu), cancellationToken), "Đã từ chối điều chỉnh.");

        [HttpGet("periods")]
        public async Task<IActionResult> GetPeriods(CancellationToken cancellationToken)
            => Success(await mediator.Send(new LayDanhSachKyChamCongQuery(), cancellationToken));

        [HttpPost("periods")]
        public async Task<IActionResult> CreatePeriod([FromBody] CreateAttendancePeriodRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new TaoKyChamCongCommand(request), cancellationToken), "Đã tạo kỳ chấm công.");

        [HttpPost("periods/{id:int}/lock")]
        public async Task<IActionResult> LockPeriod(int id, CancellationToken cancellationToken)
            => Success(await mediator.Send(new KhoaKyChamCongCommand(id, CurrentUserId, true), cancellationToken), "Đã khóa kỳ chấm công.");

        [HttpPost("periods/{id:int}/unlock")]
        public async Task<IActionResult> UnlockPeriod(int id, CancellationToken cancellationToken)
            => Success(await mediator.Send(new KhoaKyChamCongCommand(id, CurrentUserId, false), cancellationToken), "Đã mở khóa kỳ chấm công.");
    }
}