using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham.Examination;
using ClinicManagement.Application.Features.LuotKham.Commands;
using ClinicManagement.Application.Features.LuotKham.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        /// <summary>
        /// Lưu dữ liệu khám ban đầu cho một lượt khám.
        /// Mục tiêu: ghi nhận lý do khám, sinh hiệu, ghi chú lâm sàng và chẩn đoán sơ bộ.
        /// Không dùng để lưu toàn bộ hồ sơ bệnh án chi tiết.
        /// </summary>
        /// <param name="luotKhamId">ID lượt khám cần cập nhật thông tin khám ban đầu.</param>
        /// <param name="request">Dữ liệu khám ban đầu.</param>
        /// <returns>Thông tin lượt khám sau khi lưu.</returns>
        [HttpPost("{luotKhamId}/examination")]
        public async Task<IActionResult> SaveInitialExamination(int luotKhamId, [FromBody] SaveExaminationRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var command = new LuuKetQuaKhamCommand
            {
                LuotKhamId = luotKhamId,
                CreatedBy = CurrentUserId,
                ExaminationData = request
            };

            var result = await _mediator.Send(command);
            return Success(result, "Lưu dữ liệu khám ban đầu thành công");
        }
        
        [HttpGet("{id}/examination")]
        public async Task<IActionResult> GetExaminationDetail(int id)
        {
            try
            {
                var result = await _mediator.Send(new LayChiTietKhamQuery { LuotKhamId = id });
                return Success(result);
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
        }
    }
}
