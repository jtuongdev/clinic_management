using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;
using System;

namespace ClinicManagement.API.Controllers
{
    public partial class LuotKhamController : BaseController
    {
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
            var query = new GetDonThuocListQuery
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

        [HttpGet("thong-ke-donthuoc")]
        public async Task<IActionResult> GetThongKeDonThuoc([FromQuery] GetThongKeDonThuocQuery query)
        {
            var result = await _mediator.Send(query);
            
            return Success(result);
        }
    }
}
