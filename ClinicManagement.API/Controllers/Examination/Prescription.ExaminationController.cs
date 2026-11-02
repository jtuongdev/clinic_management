using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;
using System;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Khám bệnh (Clinical Examination) - Quản lý Danh sách và Thống kê Đơn thuốc.
    /// Cho phép theo dõi các đơn thuốc đã kê theo bác sĩ, bệnh nhân, khoa và khoảng thời gian.
    /// </summary>
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        /// <summary>
        /// Lấy danh sách đơn thuốc có phân trang và bộ lọc (khoa, bác sĩ, bệnh nhân, trạng thái, ngày).
        /// </summary>
        [HttpGet("danh-sach-donthuoc")]
        public async Task<IActionResult> GetListDonThuoc(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? maKhoa = null,
            [FromQuery] int? maBacSi = null,
            [FromQuery] int? maBenhNhan = null,
            [FromQuery] string? trangThai = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var query = new LayDanhSachDonThuocQuery
            {
                PageIndex = pageIndex,
                PageSize = pageSize > 100 ? 100 : pageSize,
                MaKhoa = maKhoa,
                MaBacSi = maBacSi,
                MaBenhNhan = maBenhNhan,
                TrangThai = trangThai,
                FromDate = fromDate,
                ToDate = toDate
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy số liệu thống kê tổng hợp đơn thuốc theo thời gian và cơ sở.
        /// </summary>
        [HttpGet("thong-ke-donthuoc")]
        public async Task<IActionResult> GetThongKeDonThuoc([FromQuery] LayThongKeDonThuocQuery query)
        {
            var result = await _mediator.Send(query);
            
            return Success(result);
        }
    }
}
