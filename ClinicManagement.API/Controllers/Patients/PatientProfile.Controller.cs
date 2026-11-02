using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.Features.BenhNhan.Commands;
using ClinicManagement.Application.Features.BenhNhan.Queries;
using ClinicManagement.Application.Features.ThongKe.Queries;
using System;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Hồ sơ Bệnh nhân (Patients) - Phần mở rộng Xem Hồ sơ tổng thể, Lịch sử khám, Đơn thuốc, Xét nghiệm & Hóa đơn
    /// </summary>
    [ClinicalAuthorize("patient", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
    public partial class BenhNhanController : BaseController
    {
        /// <summary>
        /// Lấy hồ sơ tổng thể của bệnh nhân (Thông tin hành chính, Tiền sử, Thống kê lượt khám)
        /// </summary>
        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var query = new LayHoSoBenhNhanQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy lịch sử các lượt khám của bệnh nhân có phân trang và bộ lọc trạng thái/ngày
        /// </summary>
        [HttpGet("{id}/visits")]
        public async Task<IActionResult> GetVisits(
            int id,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var query = new LayLichSuKhamBenhNhanQuery
            {
                PatientId = id,
                PageIndex = pageIndex,
                PageSize = pageSize,
                Status = status,
                FromDate = fromDate,
                ToDate = toDate
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy lịch sử các đơn thuốc đã kê cho bệnh nhân
        /// </summary>
        [HttpGet("{id}/prescriptions")]
        public async Task<IActionResult> GetPrescriptions(
            int id,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = new LayDonThuocBenhNhanQuery
            {
                PatientId = id,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách kết quả xét nghiệm / CLS của bệnh nhân
        /// </summary>
        [HttpGet("{id}/lab-results")]
        public async Task<IActionResult> GetLabResults(
            int id,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = new LayKetQuaXetNghiemBenhNhanQuery
            {
                PatientId = id,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách hóa đơn viện phí của bệnh nhân
        /// </summary>
        [HttpGet("{id}/invoices")]
        public async Task<IActionResult> GetInvoices(
            int id,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null)
        {
            var query = new LayHoaDonBenhNhanQuery
            {
                PatientId = id,
                PageIndex = pageIndex,
                PageSize = pageSize,
                Status = status
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }
    }
}