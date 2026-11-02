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
    /// <summary>
    /// Phân hệ Khám bệnh (Clinical Examination) - Quản lý vòng đời lượt khám bệnh.
    /// Bao gồm: tra cứu danh sách, chi tiết lượt khám, xác thực hoàn tất lâm sàng, hoàn thành khám,
    /// khóa bệnh án điện tử (EMR Lock), điều phối chuyển khám cận lâm sàng (CLS) và báo cáo tiến độ.
    /// Route: /api/LuotKham, /api/examinations
    /// </summary>
    [ApiController]
    [Route("api/LuotKham")]
    [Route("api/examinations")]
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
        
        /// <summary>
        /// Lấy danh sách lượt khám bệnh có phân trang và lọc theo tiêu chí (bác sĩ, bệnh nhân, khoa, trạng thái, ngày).
        /// </summary>
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

        /// <summary>
        /// Lấy thông tin chi tiết một lượt khám theo Id.
        /// </summary>
        // GET: api/luotkham/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new LayLuotKhamTheoIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Kiểm tra tính hợp lệ về mặt lâm sàng trước khi hoàn tất lượt khám (Chẩn đoán, Chỉ định, Đơn thuốc).
        /// </summary>
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

        /// <summary>
        /// Hoàn tất lượt khám và tự động lập hóa đơn viện phí nếu có phát sinh chi phí.
        /// </summary>
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

        /// <summary>
        /// Khóa bệnh án điện tử (EMR Lock) kèm chữ ký số hoặc lý do khóa, ngăn chặn chỉnh sửa sau khi xuất viện.
        /// </summary>
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

        /// <summary>
        /// Hoàn thành lượt khám và đồng thời khóa bệnh án điện tử trong một giao dịch duy nhất.
        /// </summary>
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

        /// <summary>
        /// Chuyển trạng thái lượt khám sang chờ kết quả cận lâm sàng (CLS) để giải phóng phòng khám cho bệnh nhân khác.
        /// </summary>
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

        /// <summary>
        /// Tiếp tục khám lại bệnh nhân sau khi đã có kết quả cận lâm sàng (quay lại phòng khám ban đầu).
        /// </summary>
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

        /// <summary>
        /// Lấy tóm tắt điều trị lâm sàng của lượt khám (chẩn đoán, dịch vụ đã làm, thuốc đã kê).
        /// </summary>
        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetTreatmentSummary(int id)
        {
            var query = new LayLuotKhamTheoIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result.ToTreatmentSummary());
        }

        /// <summary>
        /// Lấy thống kê số lượng lượt khám theo cơ sở và chuyên khoa.
        /// </summary>
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

        /// <summary>
        /// Lấy danh sách lượt khám đang trong quá trình xử lý (Đang khám, Chờ CLS).
        /// </summary>
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

        /// <summary>
        /// Lấy danh sách bệnh nhân đang có lượt khám theo bộ lọc khoa/cơ sở/từ khóa.
        /// </summary>
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

        /// <summary>
        /// Lấy số liệu thống kê bệnh nhân khám theo cơ sở và chuyên khoa.
        /// </summary>
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