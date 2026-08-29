using MediatR;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    public partial class LuotKhamController : BaseController
    {
        [HttpGet("benh-nhan/{luotKhamId}/ho-so-dieu-tri")]
        public async Task<IActionResult> GetHoSoDieuTri(int luotKhamId)
        {
            var query = new GetChiTietHoSoDieuTriQuery
            {
                LuotKhamId = luotKhamId
            };

            var result = await _mediator.Send(query);
            return result == null
                ? NotFound(new { message = $"Không tìm thấy hồ sơ điều trị với Id = {luotKhamId}" })
                : Success(result);
        }
    }
}
