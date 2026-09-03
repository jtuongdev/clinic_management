using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Application.Features.LichLamViec;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChamCongController : BaseController
    {
        private readonly IMediator mediator;
        public ChamCongController(IMediator mediator) => this.mediator = mediator;

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Get(DateTime fromDate, DateTime toDate, int? maNhanVien = null, CancellationToken cancellationToken = default)
            => Success(await mediator.Send(new GetChamCongQuery(fromDate, toDate, maNhanVien), cancellationToken));

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CheckInCommand(request.MaNhanVien), cancellationToken), "Check-in thành công.");

        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest request, CancellationToken cancellationToken)
            => Success(await mediator.Send(new CheckOutCommand(request.MaNhanVien), cancellationToken), "Check-out thành công.");
    }
}