using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.PatientPortal;
using ClinicManagement.Application.Features.BenhNhan.Queries;
using ClinicManagement.Application.Features.LuotKham.Queries;
using ClinicManagement.Application.Features.PatientPortal.Commands.CapNhatHoSoMe;
using ClinicManagement.Application.Features.PatientPortal.Queries.LayChiTietDonThuocMe;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/v1/patient/me")]
    [Authorize(Roles = "Patient")]
    public class PatientMeController : BaseApiController
    {
        private readonly IMediator _mediator;

        public PatientMeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy hồ sơ cá nhân của bệnh nhân (Bao gồm thông tin chung, BHYT, tiền sử bệnh).
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var query = new LayHoSoBenhNhanQuery { Id = patientId };
            var result = await _mediator.Send(query, cancellationToken);
            if (result == null)
            {
                return Failure("Không tìm thấy thông tin bệnh nhân.", 404);
            }

            return Success(result);
        }

        /// <summary>
        /// Cập nhật thông tin liên lạc, địa chỉ của bệnh nhân.
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] CapNhatHoSoMeDto request,
            CancellationToken cancellationToken)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var command = new CapNhatHoSoMeCommand
            {
                PatientId = patientId,
                Ho = request.Ho,
                Ten = request.Ten,
                NgaySinh = request.NgaySinh,
                GioiTinh = request.GioiTinh,
                Email = request.Email,
                DiaChi = request.DiaChi,
                NguoiLienHeTen = request.NguoiLienHeTen,
                NguoiLienHeDienThoai = request.NguoiLienHeDienThoai
            };

            try
            {
                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, "Cập nhật hồ sơ bệnh nhân thành công");
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (Exception ex)
            {
                return Failure($"Cập nhật hồ sơ thất bại: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// Lấy danh sách lịch sử các lượt khám bệnh của bệnh nhân (có phân trang, sắp xếp mới nhất).
        /// </summary>
        [HttpGet("visits")]
        public async Task<IActionResult> GetVisits(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var query = new LayLichSuKhamBenhNhanQuery
            {
                PatientId = patientId,
                PageIndex = Math.Max(1, pageIndex),
                PageSize = Math.Clamp(pageSize, 1, 50),
                Status = status,
                FromDate = fromDate,
                ToDate = toDate
            };

            var result = await _mediator.Send(query, cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Xem chi tiết một lượt khám bệnh (chẩn đoán, sinh hiệu, chỉ định dịch vụ).
        /// Đảm bảo chống IDOR: chỉ cho phép xem lượt khám của chính bệnh nhân đang đăng nhập.
        /// </summary>
        [HttpGet("visits/{visitId:int}")]
        public async Task<IActionResult> GetVisitDetail(int visitId, CancellationToken cancellationToken)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            try
            {
                var result = await _mediator.Send(new LayLuotKhamTheoIdQuery { Id = visitId }, cancellationToken);
                if (result == null || result.MaBenhNhan != patientId)
                {
                    return Failure("Không tìm thấy lượt khám hoặc bạn không có quyền truy cập.", 404);
                }

                return Success(result);
            }
            catch (KeyNotFoundException)
            {
                return Failure("Không tìm thấy lượt khám.", 404);
            }
        }

        /// <summary>
        /// Lấy danh sách các đơn thuốc điện tử đã được kê cho bệnh nhân.
        /// </summary>
        [HttpGet("prescriptions")]
        public async Task<IActionResult> GetPrescriptions(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var query = new LayDonThuocBenhNhanQuery
            {
                PatientId = patientId,
                PageIndex = Math.Max(1, pageIndex),
                PageSize = Math.Clamp(pageSize, 1, 50)
            };

            var result = await _mediator.Send(query, cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Xem chi tiết một đơn thuốc (danh sách thuốc, hàm lượng, cách dùng, liều dùng).
        /// Đảm bảo chống IDOR: chỉ cho phép xem đơn thuốc thuộc về bệnh nhân đang đăng nhập.
        /// </summary>
        [HttpGet("prescriptions/{id:int}")]
        public async Task<IActionResult> GetPrescriptionDetail(int id, CancellationToken cancellationToken)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var result = await _mediator.Send(new LayChiTietDonThuocMeQuery
            {
                PatientId = patientId,
                PrescriptionId = id
            }, cancellationToken);

            if (result == null)
            {
                return Failure("Không tìm thấy đơn thuốc hoặc bạn không có quyền truy cập.", 404);
            }

            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách kết quả xét nghiệm và chẩn đoán hình ảnh của bệnh nhân.
        /// </summary>
        [HttpGet("lab-results")]
        public async Task<IActionResult> GetLabResults(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var query = new LayKetQuaXetNghiemBenhNhanQuery
            {
                PatientId = patientId,
                PageIndex = Math.Max(1, pageIndex),
                PageSize = Math.Clamp(pageSize, 1, 50)
            };

            var result = await _mediator.Send(query, cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách hóa đơn viện phí và phiếu thu liên quan của bệnh nhân.
        /// </summary>
        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            CancellationToken cancellationToken = default)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var query = new LayHoaDonBenhNhanQuery
            {
                PatientId = patientId,
                PageIndex = Math.Max(1, pageIndex),
                PageSize = Math.Clamp(pageSize, 1, 50),
                Status = status
            };

            var result = await _mediator.Send(query, cancellationToken);
            return Success(result);
        }
    }
}
