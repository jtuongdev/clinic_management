using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.PatientBooking;
using ClinicManagement.Application.Features.LichHen.Commands.TaoLichHen;
using ClinicManagement.Application.Features.LichHen.Queries.LaySlotKhamBacSi;
using ClinicManagement.Application.Features.PatientBooking.Commands.HuyLichHenBenhNhan;
using ClinicManagement.Application.Features.PatientBooking.Queries.LayDanhSachBacSiBooking;
using ClinicManagement.Application.Features.PatientBooking.Queries.LayDanhSachChuyenKhoaBooking;
using ClinicManagement.Application.Features.PatientBooking.Queries.LayDanhSachCoSoBooking;
using ClinicManagement.Application.Features.PatientBooking.Queries.LayLichHenCuaBenhNhan;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/v1/patient/booking")]
    public class PatientBookingController : BaseApiController
    {
        private readonly IMediator _mediator;

        public PatientBookingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách các cơ sở / chi nhánh phòng khám.
        /// </summary>
        [HttpGet("facilities")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFacilities(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new LayDanhSachCoSoBookingQuery(), cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh mục các chuyên khoa khám chữa bệnh.
        /// </summary>
        [HttpGet("specialties")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSpecialties(
            [FromQuery] int? maCoSo,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new LayDanhSachChuyenKhoaBookingQuery { MaCoSo = maCoSo }, cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách bác sĩ phục vụ đặt lịch khám (lọc theo khoa hoặc cơ sở).
        /// </summary>
        [HttpGet("doctors")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDoctors(
            [FromQuery] int? maKhoa,
            [FromQuery] int? maCoSo,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new LayDanhSachBacSiBookingQuery
            {
                MaKhoa = maKhoa,
                MaCoSo = maCoSo
            }, cancellationToken);

            return Success(result);
        }

        /// <summary>
        /// Tính toán và lấy danh sách các khung giờ khám khả dụng của bác sĩ theo ngày (Slot 30 phút).
        /// </summary>
        [HttpGet("doctors/{doctorId:int}/slots")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDoctorSlots(
            int doctorId,
            [FromQuery] DateTime? date,
            CancellationToken cancellationToken)
        {
            if (doctorId <= 0)
            {
                return Failure("Mã bác sĩ không hợp lệ.", 400);
            }

            var query = new LaySlotKhamBacSiQuery
            {
                MaBacSi = doctorId,
                NgayKham = date ?? DateTime.Today
            };

            var result = await _mediator.Send(query, cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Bệnh nhân tạo lịch hẹn khám mới trên ứng dụng mobile.
        /// </summary>
        [HttpPost("appointments")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> CreateAppointment(
            [FromBody] CreatePatientAppointmentRequestDto request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var command = new TaoLichHenCommand
            {
                MaBenhNhan = patientId,
                MaBacSi = request.MaBacSi,
                MaCoSo = request.MaCoSo,
                MaKhoa = request.MaKhoa,
                ThoiGianBatDau = request.ThoiGianBatDau,
                ThoiGianKetThuc = request.ThoiGianKetThuc,
                LyDo = request.LyDo,
                NguonDat = "APP_PATIENT",
                CreatedBy = patientId
            };

            try
            {
                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, "Đặt lịch khám thành công.");
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return Failure($"Đặt lịch khám thất bại: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// Lấy danh sách lịch hẹn của tôi (Lọc theo nhóm trạng thái: SAP_TOI, DA_KHAM, DA_HUY).
        /// </summary>
        [HttpGet("appointments")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyAppointments(
            [FromQuery] string? statusGroup,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var query = new LayLichHenCuaBenhNhanQuery
            {
                PatientId = patientId,
                StatusGroup = statusGroup,
                PageIndex = Math.Max(1, pageIndex),
                PageSize = Math.Clamp(pageSize, 1, 50)
            };

            var result = await _mediator.Send(query, cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Bệnh nhân tự hủy lịch hẹn (chỉ cho phép trước giờ khám tối thiểu 2 tiếng).
        /// </summary>
        [HttpPut("appointments/{id:int}/cancel")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> CancelAppointment(
            int id,
            [FromBody] CancelPatientAppointmentRequestDto request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            int patientId = CurrentPatientId;
            if (patientId <= 0)
            {
                return Failure("Không thể xác thực danh tính bệnh nhân.", 401);
            }

            var command = new HuyLichHenBenhNhanCommand
            {
                AppointmentId = id,
                PatientId = patientId,
                LyDoHuy = request.LyDoHuy
            };

            try
            {
                var result = await _mediator.Send(command, cancellationToken);
                return Success(result, "Hủy lịch hẹn thành công.");
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
                return Failure($"Hủy lịch hẹn thất bại: {ex.Message}", 500);
            }
        }
    }
}
