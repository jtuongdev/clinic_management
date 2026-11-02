using ClinicManagement.Application.Features.CoSo.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Cơ sở Y tế (Facilities) - Quản lý Chi nhánh & Điểm khám
    /// Route: api/CoSo, api/facilities
    /// </summary>
    [ApiController]
    [Route("api/CoSo")]
    [Route("api/facilities")]
    // [Authorize]
    public class CoSoController : BaseController
    {
        private readonly IMediator _mediator;

        public CoSoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách cơ sở y tế phục vụ chọn lựa (Dropdown)
        /// </summary>
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