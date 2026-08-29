using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.Features.BenhNhan.Commands;
using ClinicManagement.Application.Features.BenhNhan.Queries;
using ClinicManagement.Application.Features.ThongKe.Queries;
using ClinicManagement.Domain.Common.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public partial class BenhNhanController : BaseController
    {
        private readonly IMediator _mediator;

        public BenhNhanController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/benhnhan/paged?pageIndex=1&pageSize=10&keyword=...&includeDeleted=false
        [HttpGet("paged")]
        // [Authorize(Roles = "Admin,LeTan")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? keyword = null,
            [FromQuery] bool includeDeleted = false)
        {
            // Giới hạn pageSize tối đa
            if (pageSize > 100) pageSize = 100;
            if (pageIndex < 1) pageIndex = 1;

            var query = new GetBenhNhansPagedQuery
            {
                PageIndex = pageIndex,
                PageSize = pageSize,
                Keyword = keyword,
                IncludeDeleted = includeDeleted
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }


        [HttpGet("count/benhnhan/thongke")]
        public async Task<IActionResult> GetThongKeBenhNhan()
        {
            var query = new GetThongKeBenhNhanQuery();
            var result = await _mediator.Send(query);
            return Success(result);
        }

        // POST: api/benhnhan
        [HttpPost]
        [Authorize(Roles = "Admin,LeTan")]
        public async Task<IActionResult> Create([FromBody] CreateBenhNhanRequest request)
        {
            var command = new CreateBenhNhanCommand
            {
                Ho = request.Ho,
                Ten = request.Ten,
                NgaySinh = request.NgaySinh,
                GioiTinh = request.GioiTinh,
                DienThoai = request.DienThoai,
                Email = request.Email,
                SoCCCD = request.SoCCCD,
                DiaChi = request.DiaChi,
                NguoiLienHeTen = request.NguoiLienHeTen,
                NguoiLienHeDienThoai = request.NguoiLienHeDienThoai,
                MaPhongKham = request.MaPhongKham,
                MaCoSo = request.MaCoSo,
                MaKhoa = request.MaKhoa,
                MaBacSi = request.MaBacSi,
                BaoHiem = request.BaoHiem,
                TienSuBenhs = request.TienSuBenhs,

                CreatedBy = CurrentUserId
            };

            var result = await _mediator.Send(command);
            return Success(result, "Tạo bệnh nhân thành công");
        }

        // PUT: api/benhnhan/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,LeTan")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBenhNhanRequest request)
        {
            if (id != request.Id)
                return Failure("Id không khớp", 400);

            var command = new UpdateBenhNhanCommand
            {
                Id = request.Id,
                Ho = request.Ho,
                Ten = request.Ten,
                NgaySinh = request.NgaySinh,
                GioiTinh = request.GioiTinh,
                DienThoai = request.DienThoai,
                Email = request.Email,
                DiaChi = request.DiaChi,
                NguoiLienHeTen = request.NguoiLienHeTen,
                NguoiLienHeDienThoai = request.NguoiLienHeDienThoai,
                UpdatedBy = CurrentUserId
            };

            var result = await _mediator.Send(command);
            return Success(result, "Cập nhật bệnh nhân thành công");
        }

        // DELETE: api/benhnhan/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteBenhNhanCommand { Id = id, DeletedBy = CurrentUserId };
            await _mediator.Send(command);
            return Success(true, "Xóa bệnh nhân thành công");
        }

        // GET: api/benhnhan/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetBenhNhanByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/benhnhan/search?keyword=...
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword = "")
        {
            var query = new SearchBenhNhanQuery { Keyword = keyword };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/benhnhan/filter-by-date?fromDate=...&toDate=...
        [HttpGet("filter-by-date")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            var query = new GetBenhNhanByDateRangeQuery { FromDate = fromDate, ToDate = toDate };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/benhnhan/deleted
        [HttpGet("deleted")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDeleted()
        {
            var query = new GetDeletedBenhNhansQuery();
            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/benhnhan/{id}/tiensu
        [HttpGet("{id}/tiensu")]
        public async Task<IActionResult> GetTienSu(int id)
        {
            var query = new GetTienSuByBenhNhanIdQuery { BenhNhanId = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/benhnhan/{id}/tiensu/latest
        [HttpGet("{id}/tiensu/latest")]
        public async Task<IActionResult> GetLatestTienSu(int id)
        {
            var query = new GetLatestTienSuQuery { BenhNhanId = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        // GET: api/benhnhan/loai-tien-su
        [HttpGet("loai-tien-su")]
        public async Task<IActionResult> GetLoaiTienSu()
        {
            var query = new GetLoaiTienSuOptionsQuery();
            var result = await _mediator.Send(query);
            return Success(result);
        }
    }
}