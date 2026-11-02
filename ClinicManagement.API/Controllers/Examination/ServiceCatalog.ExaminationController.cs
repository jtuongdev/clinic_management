using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.LuotKham.Queries.DanhMucDichVu;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Khám bệnh (Clinical Examination) - Tra cứu Danh mục dịch vụ khám, kỹ thuật và CLS.
    /// Cho phép bác sĩ tìm kiếm bảng giá và danh mục dịch vụ phục vụ chỉ định.
    /// </summary>
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        /// <summary>
        /// Lấy danh mục dịch vụ khám và kỹ thuật cận lâm sàng theo loại dịch vụ.
        /// </summary>
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
