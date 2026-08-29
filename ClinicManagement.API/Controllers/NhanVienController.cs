using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Application.Features.NhanVien.Queries;
using System;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public class NhanVienController : BaseController
    {
        private readonly IMediator _mediator;

        public NhanVienController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("bac-si")]
        public async Task<IActionResult> GetBacSiByKhoa(
            [FromQuery] int maKhoa)
        {
            var query = new GetBacSiByKhoaQuery
            {
                MaKhoa = maKhoa,
                MaCoSo = 1
            };

            var result = await _mediator.Send(query);

            return Success(result);
        }
        [HttpGet("bac-si-truc")]
        public async Task<IActionResult> GetBacSiTruc(
            [FromQuery] int? maCoSo = null,
            [FromQuery] int? maKhoa = null)
        {
            var query = new GetBacSiTrucQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }
    }
}