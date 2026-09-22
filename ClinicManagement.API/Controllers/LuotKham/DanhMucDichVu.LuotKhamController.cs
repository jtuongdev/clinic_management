using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.LuotKham.Queries.DanhMucDichVu;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        [HttpGet("danh-muc-dich-vu")]
        public async Task<IActionResult> GetDanhMucDichVu([FromQuery] string? loaiDichVu = null)
        {
            var query = new LayDanhSachDanhMucDichVuQuery
            {
                LoaiDichVu = loaiDichVu
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }
    }
}
