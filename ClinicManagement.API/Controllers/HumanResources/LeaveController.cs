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
    /// <summary>
    /// Phân hệ Nhân sự (Human Resources) - Quản lý Nghỉ phép và Đơn từ nhân viên.
    /// Bao gồm: tra cứu danh sách đơn nghỉ phép, gửi đơn xin nghỉ, phê duyệt/từ chối đơn và hủy đơn nghỉ phép.
    /// Route: /api/NghiPhep, /api/leaves
    /// </summary>
    [ApiController]
    [Route("api/NghiPhep")]
    [Route("api/leaves")]
    [ClinicalAuthorize("hr", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
    public class NghiPhepController : BaseController
    {
        private readonly IMediator mediator;
        public NghiPhepController(IMediator mediator) => this.mediator = mediator;

        /// <summary>
        /// Lấy danh sách đơn nghỉ phép trong khoảng thời gian theo nhân viên và trạng thái duyệt.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get(DateTime fromDate, DateTime toDate, int? maNhanVien = null, string? trangThai = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GetNghiPhepQuery(fromDate, toDate, maNhanVien, trangThai), cancellationToken));

        /// <summary>
        /// Gửi đơn đăng ký xin nghỉ phép mới.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNghiPhepRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CreateNghiPhepCommand(request), cancellationToken), "Tạo đơn nghỉ phép thành công.");

        /// <summary>
        /// Xét duyệt đơn xin nghỉ phép (Phê duyệt hoặc Từ chối kèm lý do).
        /// </summary>
        [HttpPost("{id:int}/review")]
        public async Task<IActionResult> Review(int id, [FromBody] ReviewNghiPhepRequest request, [FromQuery] bool approved, CancellationToken cancellationToken)
            => Success(await mediator.Send(new ReviewNghiPhepCommand(id, CurrentUserId, approved, request.GhiChu), cancellationToken), "Đã xử lý đơn nghỉ phép.");

        /// <summary>
        /// Hủy đơn xin nghỉ phép đã gửi.
        /// </summary>
        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CancelNghiPhepCommand(id), cancellationToken), "Đã hủy đơn nghỉ phép.");
    }
}