using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using ClinicManagement.Application.Features.LuotKham.Commands.CompleteExam;
using ClinicManagement.Application.Features.LuotKham.Commands.HoanThanhVaKhoaKham;
using ClinicManagement.Application.Features.LuotKham.Commands.ChuyenTrangThaiChoCls;
using ClinicManagement.Application.DTOs.Medical;
using ClinicManagement.Application.Services.Interfaces;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        private readonly IMediator _mediator;
        private readonly IClinicalGovernanceService _clinicalGovernanceService;

        public LuotKhamController(IMediator mediator, IClinicalGovernanceService clinicalGovernanceService)
        {
            _mediator = mediator;
            _clinicalGovernanceService = clinicalGovernanceService;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? maBenhNhan = null,
            [FromQuery] int? maBacSi = null,
            [FromQuery] int? maKhoa = null,
            [FromQuery] string? trangThai = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var query = new LayDanhSachLuotKhamQuery
            {
                PageIndex = pageIndex,
                PageSize = pageSize > 100 ? 100 : pageSize,
                MaBenhNhan = maBenhNhan,
                MaBacSi = maBacSi,
                MaKhoa = maKhoa,
                TrangThai = trangThai,
                FromDate = fromDate,
                ToDate = toDate,
                SortBy = "ngaykham",
                SortDesc = true
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/luotkham/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new LayLuotKhamTheoIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        [HttpPost("{id}/validate")]
        public async Task<IActionResult> ValidateCompletion(int id, CancellationToken cancellationToken)
        {
            var validation = await _clinicalGovernanceService.ValidateClinicalRecordCompletionAsync(id, cancellationToken);
            if (!validation.IsValid)
            {
                return Failure(string.Join("; ", validation.Errors), 400);
            }

            return Success(validation, "Lượt khám đạt điều kiện hoàn tất.");
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> Complete(int id, CancellationToken cancellationToken)
        {
            var validation = await _clinicalGovernanceService.ValidateClinicalRecordCompletionAsync(id, cancellationToken);
            if (!validation.IsValid)
            {
                return Failure(string.Join("; ", validation.Errors), 400);
            }

            var result = await _mediator.Send(
                new HoanThanhKhamCommand(id, CurrentUserId), cancellationToken);
            if (result is null)
                return Success(new { success = true, message = "Lượt khám đã hoàn tất nhưng không tạo hóa đơn do tổng tiền bằng 0." });

            return Success(result, "Hoàn thành lượt khám và tạo hóa đơn thành công");
        }

        [HttpPost("{id}/emr/lock")]
        public async Task<IActionResult> LockEmr(int id, [FromBody] LockEmrRequest? request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _clinicalGovernanceService.LockEmrAsync(
                    id,
                    CurrentUserId,
                    request?.LyDo,
                    request?.ChuKySo,
                    cancellationToken);

                return Success(result, result.Message);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
        }

        [HttpPost("{id}/complete-and-lock")]
        public async Task<IActionResult> CompleteAndLock(
            int id,
            [FromBody] LockEmrRequest? request,
            CancellationToken cancellationToken)
        {
            try
            {
                var command = new HoanThanhVaKhoaKhamCommand(
                    id,
                    CurrentUserId,
                    request?.LyDo,
                    request?.ChuKySo
                );

                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, result.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                var innermost = ex;
                while (innermost.InnerException != null)
                {
                    innermost = innermost.InnerException;
                }
                return Failure($"Lỗi xử lý hoàn tất và khóa hồ sơ: {innermost.Message}", 500);
            }
        }

        [HttpPost("{id}/send-to-paraclinical")]
        public async Task<IActionResult> SendToParaclinical(int id, CancellationToken cancellationToken)
        {
            try
            {
                var command = new ChuyenTrangThaiChoClsCommand(
                    id,
                    HanhDongChuyenTrangThaiCls.ChuyenChoCls,
                    CurrentUserId
                );

                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, result.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
        }

        [HttpPost("{id}/resume-exam")]
        public async Task<IActionResult> ResumeExam(int id, CancellationToken cancellationToken)
        {
            try
            {
                var command = new ChuyenTrangThaiChoClsCommand(
                    id,
                    HanhDongChuyenTrangThaiCls.TiepTucKham,
                    CurrentUserId
                );

                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, result.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
        }

        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetTreatmentSummary(int id)
        {
            var query = new LayLuotKhamTheoIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result.ToTreatmentSummary());
        }
        // GET: api/luotkham/thong-ke
        [HttpGet("thong-ke")]
        public async Task<IActionResult> ThongKe(
            [FromQuery] int? maCoSo = null,
            [FromQuery] int? maKhoa = null)
        {
            var query = new LayThongKeLuotKhamQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        // GET: api/luotkham/dang-xu-ly
        [HttpGet("dang-xu-ly")]
        public async Task<IActionResult> GetDangXuLy(
            [FromQuery] int? maCoSo = null,
            [FromQuery] int? maKhoa = null)
        {
            var query = new LayLuotKhamDangXuLyQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        [HttpGet("danh-sach-benh-nhan")]
        public async Task<IActionResult> GetDanhSachBenhNhan(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? keyword = null,
            [FromQuery] string? trangThai = null,
            [FromQuery] int? maKhoa = null,
            [FromQuery] int? maCoSo = null)
        {
            var query = new LayDanhSachBenhNhanQuery
            {
                PageIndex = pageIndex,
                PageSize = pageSize > 100 ? 100 : pageSize,
                Keyword = keyword,
                TrangThai = trangThai,
                MaKhoa = maKhoa,
                MaCoSo = maCoSo
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        [HttpGet("thong-ke-benh-nhan")]
        public async Task<IActionResult> GetThongKeBenhNhan(
            [FromQuery] int? maCoSo = null,
            [FromQuery] int? maKhoa = null)
        {
            var query = new LayThongKeBenhNhanQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        /// <summary>
        /// Lấy thống kê lượt khám theo cơ sở và khoa
        /// </summary>
        /// <param name="maCoSo">Mã cơ sở (tùy chọn)</param>
        /// <param name="maKhoa">Mã khoa (tùy chọn)</param>
        /// <returns>Thống kê số lượng theo trạng thái</returns>
        [HttpGet("thong-ke-kham-benh")]
        public async Task<IActionResult> GetThongKeKhamBenh(
            [FromQuery] int? maCoSo,
            [FromQuery] int? maKhoa)
        {
            var query = new LayThongKeKhamBenhQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };

            var result = await _mediator.Send(query);

            return Success(result);
        }

    }
}