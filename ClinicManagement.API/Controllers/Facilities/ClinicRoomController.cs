using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.PhongKham.Queries;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Phòng khám (Clinic Rooms) - Quản lý Buồng khám & Phòng chức năng
    /// Route: api/PhongKham, api/clinic-rooms
    /// </summary>
    [ApiController]
    [Route("api/PhongKham")]
    [Route("api/clinic-rooms")]
    // [Authorize]
    public class PhongKhamController : BaseController
    {
        private readonly IMediator _mediator;

        public PhongKhamController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách phòng khám theo chuyên khoa
        /// </summary>
        [HttpGet("by-khoa/{maKhoa}")]
        public async Task<IActionResult> GetByKhoa(int maKhoa)
        {
            var query = new LayPhongKhamTheoKhoaQuery { MaKhoa = maKhoa };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách phòng khám phục vụ chọn lựa (Dropdown)
        /// </summary>
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown([FromQuery] int? maKhoa = null)
        {
            var query = new LayDanhSachPhongKhamDropdownQuery { MaKhoa = maKhoa };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        
    }
}