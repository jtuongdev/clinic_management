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
    public class LichLamViecController : BaseController
    {
        private readonly IMediator mediator;
        public LichLamViecController(IMediator mediator) => this.mediator = mediator;

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] int? maNhanVien = null,
            [FromQuery] int? maKhoa = null,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetLichLamViecQuery(fromDate, toDate, maNhanVien, maKhoa), cancellationToken);
            return Success(result);
        }

        [HttpGet("my-schedule")]
        [AllowSelf]
        public async Task<IActionResult> GetMySchedule([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null, CancellationToken cancellationToken = default)
        {
            var from = fromDate ?? DateTime.Today.AddDays(-7);
            var to = toDate ?? DateTime.Today.AddDays(28);
            var result = await mediator.Send(new GetLichLamViecQuery(from, to, CurrentUserId), cancellationToken);
            return Success(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLichLamViecRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await mediator.Send(new CreateLichLamViecCommand(request), cancellationToken);
                return CreatedAtAction(nameof(Get), new { fromDate = result.NgayLam, toDate = result.NgayLam }, ApiResponse<object>.Ok(result, "Tạo lịch làm việc thành công."));
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message);
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] BulkScheduleRequest request, CancellationToken cancellationToken)
        {
            var result = await mediator.Send(new PhanLichHangLoatCommand(request), cancellationToken);
            return Success(result, "Đã xử lý tạo lịch hàng loạt.");
        }

        [HttpGet("fixed")]
        public async Task<IActionResult> GetFixed([FromQuery] int? maNhanVien = null, [FromQuery] int? maKhoa = null,
            CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GetLichLamViecCoDinhQuery(maNhanVien, maKhoa), cancellationToken));

        [HttpPost("fixed")]
        public async Task<IActionResult> CreateFixed([FromBody] CreateLichLamViecCoDinhRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CreateLichLamViecCoDinhCommand(request), cancellationToken), "Tạo lịch cố định thành công.");

        [HttpPost("fixed/bulk")]
        public async Task<IActionResult> BulkCreateFixed([FromBody] BulkFixedScheduleRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new BulkCreateLichLamViecCoDinhCommand(request), cancellationToken),
                "Đã xử lý tạo lịch cố định hàng loạt.");

        [HttpDelete("fixed/{id:int}")]
        public async Task<IActionResult> DeleteFixed(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new DeleteLichLamViecCoDinhCommand(id, CurrentUserId), cancellationToken);
            return Success<object>(null, "Xóa lịch cố định thành công.");
        }

        [HttpPut("fixed/{id:int}")]
        public async Task<IActionResult> UpdateFixed(int id, [FromBody] UpdateLichLamViecCoDinhRequest request,
            CancellationToken cancellationToken)
            => Success(await mediator.Send(new UpdateLichLamViecCoDinhCommand(id, request), cancellationToken),
                "Cập nhật lịch cố định thành công.");

        [HttpPost("fixed/set")]
        public async Task<IActionResult> SetFixedSchedule([FromBody] SetFixedScheduleRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new SetFixedScheduleCommand(request.MaNhanVien, request.Shifts), cancellationToken),
                "Thiết lập lịch cố định cho nhân viên thành công.");

        [HttpPost("generate-monthly")]
        public async Task<IActionResult> GenerateMonthly([FromBody] GenerateMonthlyScheduleRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new GenerateMonthlyScheduleCommand(request.Thang, request.Nam, request.MaKhoa, request.MaNhanVien), cancellationToken),
                $"Đã sinh lịch làm việc tự động cho tháng {request.Thang}/{request.Nam}.");

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromQuery] DateTime tuNgay, [FromQuery] DateTime denNgay,
            [FromQuery] int? maKhoa = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GenerateLichLamViecCommand(tuNgay, denNgay, maKhoa), cancellationToken),
                "Đã sinh lịch ngày từ lịch cố định.");

        [HttpPost("preview-generate")]
        public async Task<IActionResult> PreviewGenerate([FromQuery] DateTime tuNgay, [FromQuery] DateTime denNgay,
            [FromQuery] int? maKhoa = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new PreviewGenerateLichLamViecCommand(tuNgay, denNgay, maKhoa), cancellationToken),
                "Đã xem trước lịch ngày.");

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLichLamViecRequest request, CancellationToken cancellationToken)
        {
            var result = await mediator.Send(new UpdateLichLamViecCommand(id, request, CurrentUserId), cancellationToken);
            return Success(result, "Cập nhật lịch làm việc thành công.");
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new DeleteLichLamViecCommand(id, CurrentUserId), cancellationToken);
            return Success<object>(null, "Xóa lịch làm việc thành công.");
        }

        [HttpGet("{id:int}/adjustments")]
        public async Task<IActionResult> GetAdjustments(int id, CancellationToken cancellationToken)
            => Success(await mediator.Send(new LayDieuChinhLichLamViecQuery(id), cancellationToken));
    }
}