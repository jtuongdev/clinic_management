using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ClinicalAuthorize("patient", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
    public partial class LuotKhamController : BaseController
    {
        [HttpGet("benh-nhan/{luotKhamId}/ho-so-dieu-tri")]
        public async Task<IActionResult> GetHoSoDieuTri(int luotKhamId)
        {
            var query = new LayChiTietHoSoDieuTriQuery
            {
                LuotKhamId = luotKhamId
            };

            var result = await _mediator.Send(query);
            return result == null
                ? NotFound(new { message = $"Không tìm thấy hồ sơ điều trị với Id = {luotKhamId}" })
                : Success(result);
        }

        [HttpGet("benh-nhan/{luotKhamId}/thong-tin-benh-nhan")]
        public async Task<IActionResult> GetThongTinBenhNhanTrongLuotKham(int luotKhamId)
        {
            var query = new LayThongTinBenhNhanTrongLuotKhamQuery
            {
                LuotKhamId = luotKhamId
            };

            var result = await _mediator.Send(query);
            return result == null
                ? NotFound(new { message = $"Không tìm thấy thông tin bệnh nhân cho lượt khám Id = {luotKhamId}" })
                : Success(result);
        }
    }
}
