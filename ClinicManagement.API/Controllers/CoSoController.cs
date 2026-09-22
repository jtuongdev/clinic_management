using ClinicManagement.Application.Features.CoSo.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public class CoSoController : BaseController
    {
        private readonly IMediator _mediator;

        public CoSoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown(
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new LayDanhSachCoSoDropdownQuery(),
                cancellationToken);

            return Success(result, "Lấy danh sách cơ sở thành công");
        }
    }
}