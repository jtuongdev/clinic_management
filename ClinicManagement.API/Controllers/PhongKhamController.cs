using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.PhongKham.Queries;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public class PhongKhamController : BaseController
    {
        private readonly IMediator _mediator;

        public PhongKhamController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/phongkham/by-khoa/{maKhoa}
        [HttpGet("by-khoa/{maKhoa}")]
        public async Task<IActionResult> GetByKhoa(int maKhoa)
        {
            var query = new LayPhongKhamTheoKhoaQuery { MaKhoa = maKhoa };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown([FromQuery] int? maKhoa = null)
        {
            var query = new LayDanhSachPhongKhamDropdownQuery { MaKhoa = maKhoa };
            var result = await _mediator.Send(query);
            return Success(result);
        }
        
    }
}