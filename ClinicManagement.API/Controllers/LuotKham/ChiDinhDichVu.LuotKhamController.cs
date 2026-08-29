using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    public partial class LuotKhamController : BaseController{

        
        [HttpGet("thong-ke-chi-dinh")]
        public async Task<IActionResult> GetThongKeChiDinh(
            [FromQuery] int? maCoSo,
            [FromQuery] int? maKhoa)
        {
            var query = new GetThongKeChiDinhQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }
        [HttpGet("danh-sach-chi-dinh")]
        public async Task<IActionResult> GetChiDinhDichVuList(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? maKhoa = null,
            [FromQuery] int? maBacSi = null,
            [FromQuery] int? maBenhNhan = null,
            [FromQuery] string? loaiDichVu = null,
            [FromQuery] string? trangThai = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var query = new GetChiDinhDichVuListQuery
            {
                PageIndex = pageIndex,
                PageSize = pageSize > 100 ? 100 : pageSize,
                MaKhoa = maKhoa,
                MaBacSi = maBacSi,
                MaBenhNhan = maBenhNhan,
                LoaiDichVu = loaiDichVu,
                TrangThai = trangThai,
                FromDate = fromDate,
                ToDate = toDate
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }
    }
}