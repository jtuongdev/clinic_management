using System.Threading.Tasks;
using ClinicManagement.Application.Features.LuotKham.Queries.DanhMucDichVu;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    public partial class LuotKhamController : BaseController
    {
        [HttpGet("danh-muc-dich-vu")]
        public async Task<IActionResult> GetDanhMucDichVu([FromQuery] string? loaiDichVu = null)
        {
            var query = new GetDanhMucDichVuListQuery
            {
                LoaiDichVu = loaiDichVu
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }
    }
}
