using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Khám bệnh (Clinical Examination) - Quản lý Hồ sơ điều trị và Thông tin bệnh nhân trong lượt khám.
    /// Cho phép bác sĩ xem bệnh sử, tóm tắt điều trị và thông tin hành chính của bệnh nhân theo lượt khám.
    /// </summary>
    [ClinicalAuthorize("patient", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
    public partial class LuotKhamController : BaseController
    {
        /// <summary>
        /// Lấy chi tiết toàn bộ hồ sơ điều trị gắn với lượt khám (tiền sử, triệu chứng, chỉ định, thuốc).
        /// </summary>
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

        /// <summary>
        /// Lấy thông tin hành chính và sinh hiệu cơ bản của bệnh nhân trong lượt khám hiện tại.
        /// </summary>
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
