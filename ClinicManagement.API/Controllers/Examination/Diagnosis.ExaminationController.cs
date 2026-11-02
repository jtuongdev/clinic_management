using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using ClinicManagement.Application.Features.LuotKham.Queries;
using ClinicManagement.Application.Features.LuotKham.Commands;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Khám bệnh (Clinical Examination) - Quản lý Chẩn đoán bệnh và Mã hóa ICD-10.
    /// Cung cấp API tìm kiếm danh mục ICD-10, thêm, cập nhật, xóa các chẩn đoán xác định/phụ/sơ bộ cho lượt khám.
    /// </summary>
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        /// <summary>
        /// Tra cứu danh mục mã bệnh ICD-10 theo từ khóa (mã hoặc tên bệnh).
        /// </summary>
        [HttpGet("icd")]
        public async Task<IActionResult> SearchICD([FromQuery] string? keyword = null)
        {
            var result = await _mediator.Send(new TimKiemICDQuery { Keyword = keyword });
            return Success(result);
        }
        
        /// <summary>
        /// Lấy danh sách chẩn đoán y khoa của lượt khám.
        /// </summary>
        [HttpGet("{id}/diagnoses")]
        public async Task<IActionResult> GetDiagnoses(int id)
        {
            try
            {
                var query = new LayDanhSachChanDoanQuery
                {
                    LuotKhamId = id
                };

                var result = await _mediator.Send(query);
                return Success(result);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần
                return Failure("Đã xảy ra lỗi khi lấy danh sách chẩn đoán.", 500);
            }
        }

        /// <summary>
        /// Thêm mới một chẩn đoán bệnh cho lượt khám.
        /// </summary>
        [HttpPost("{id}/diagnoses")]
        public async Task<IActionResult> CreateDiagnosis(int id, [FromBody] ChanDoanRequest request)
        {
            try
            {
                var result = await _mediator.Send(new TaoChanDoanCommand
                {
                    LuotKhamId = id,
                    CreatedBy = CurrentUserId,
                    Data = request
                });
                return Success(result, "Thêm chẩn đoán thành công");
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 409);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
        }

        /// <summary>
        /// Cập nhật thông tin chẩn đoán bệnh đã lưu trong lượt khám.
        /// </summary>
        [HttpPut("{id}/diagnoses/{diagnosisId}")]
        public async Task<IActionResult> UpdateDiagnosis(int id, int diagnosisId, [FromBody] ChanDoanRequest request)
        {
            try
            {
                var result = await _mediator.Send(new CapNhatChanDoanCommand
                {
                    LuotKhamId = id,
                    ChanDoanId = diagnosisId,
                    UpdatedBy = CurrentUserId,
                    Data = request
                });
                return Success(result, "Cập nhật chẩn đoán thành công");
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 409);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
        }
        
        /// <summary>
        /// Xóa chẩn đoán bệnh khỏi lượt khám.
        /// </summary>
        [HttpDelete("{id}/diagnoses/{diagnosisId}")]
        public async Task<IActionResult> DeleteDiagnosis(int id, int diagnosisId)
        {
            try
            {
                await _mediator.Send(new XoaChanDoanCommand
                {
                    LuotKhamId = id,
                    ChanDoanId = diagnosisId,
                    DeletedBy = CurrentUserId
                });
                return Success<object?>(null, "Xóa chẩn đoán thành công");
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, 409);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
        }
    }
}
