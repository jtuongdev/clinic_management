using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public partial class LuotKhamController : BaseController
    {
        private readonly IMediator _mediator;

        public LuotKhamController(IMediator mediator)
        {
            _mediator = mediator;
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
            var query = new GetLuotKhamListQuery
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
            var query = new GetLuotKhamByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        // GET: api/luotkham/thong-ke
        [HttpGet("thong-ke")]
        public async Task<IActionResult> ThongKe(
            [FromQuery] int? maCoSo = null,
            [FromQuery] int? maKhoa = null)
        {
            var query = new GetLuotKhamStatsQuery
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
            var query = new GetLuotKhamDangXuLyQuery
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
            var query = new GetDanhSachBenhNhanQuery
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
            var query = new GetThongKeBenhNhanQuery
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
            var query = new GetThongKeKhamBenhQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };

            var result = await _mediator.Send(query);

            return Success(result);
        }

        
    }
}