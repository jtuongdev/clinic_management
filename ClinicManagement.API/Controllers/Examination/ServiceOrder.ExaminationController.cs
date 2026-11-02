using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using System;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu;
using ClinicManagement.Application.Features.LuotKham.Queries.ChiDinhDichVu;
using ClinicManagement.Application.Features.LuotKham.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Khám bệnh (Clinical Examination) - Quản lý Chỉ định dịch vụ cận lâm sàng và thủ thuật.
    /// Cho phép bác sĩ lập chỉ định CLS (xét nghiệm, chẩn đoán hình ảnh), tiếp nhận, nhập kết quả và hủy chỉ định.
    /// </summary>
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        /// <summary>
        /// Lấy thống kê số lượng chỉ định dịch vụ theo cơ sở và chuyên khoa.
        /// </summary>
        [HttpGet("thong-ke-chi-dinh")]
        public async Task<IActionResult> GetThongKeChiDinh(
            [FromQuery] int? maCoSo,
            [FromQuery] int? maKhoa)
        {
            var query = new LayThongKeChiDinhQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách chỉ định dịch vụ có phân trang và bộ lọc nâng cao (khoa, bác sĩ, bệnh nhân, loại DV, trạng thái).
        /// </summary>
        [HttpGet("danh-sach-chi-dinh")]
        public async Task<IActionResult> GetChiDinhDichVuList(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? maKhoa = null,
            [FromQuery] int? maBacSi = null,
            [FromQuery] int? maBenhNhan = null,
            [FromQuery] string? loaiDichVu = null,
            [FromQuery] string? trangThai = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var query = new LayDanhSachChiDinhDichVuQuery
            {
                PageIndex = pageIndex,
                PageSize = pageSize > 100 ? 100 : pageSize,
                MaKhoa = maKhoa,
                MaBacSi = maBacSi,
                MaBenhNhan = maBenhNhan,
                LoaiDichVu = loaiDichVu,
                TrangThai = trangThai,
                FromDate = fromDate,
                ToDate = toDate
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách chỉ định dịch vụ của một lượt khám cụ thể.
        /// </summary>
        [HttpGet("{luotKhamId}/chi-dinh-dich-vu")]
        public async Task<IActionResult> GetChiDinhDichVuByLuotKham(int luotKhamId)
        {
            var query = new LayChiDinhDichVuTheoLuotKhamQuery { LuotKhamId = luotKhamId };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Tạo mới chỉ định dịch vụ cận lâm sàng cho lượt khám.
        /// </summary>
        [HttpPost("{luotKhamId}/chi-dinh-dich-vu")]
        public async Task<IActionResult> CreateChiDinhDichVu(int luotKhamId, [FromBody] ChiDinhDichVuRequest request)
        {
            var command = new TaoChiDinhDichVuCommand
            {
                LuotKhamId = luotKhamId,
                CreatedBy = CurrentUserId,
                Data = request
            };

            var result = await _mediator.Send(command);
            return Success(result);
        }

        /// <summary>
        /// Cập nhật thông tin phiếu chỉ định dịch vụ.
        /// </summary>
        [HttpPut("{luotKhamId}/chi-dinh-dich-vu/{chiDinhDichVuId}")]
        public async Task<IActionResult> UpdateChiDinhDichVu(int luotKhamId, int chiDinhDichVuId, [FromBody] ChiDinhDichVuRequest request)
        {
            var command = new CapNhatChiDinhDichVuCommand
            {
                LuotKhamId = luotKhamId,
                ChiDinhDichVuId = chiDinhDichVuId,
                UpdatedBy = CurrentUserId,
                Data = request
            };

            var result = await _mediator.Send(command);
            return Success(result);
        }

        /// <summary>
        /// Xóa chỉ định dịch vụ khỏi lượt khám.
        /// </summary>
        [HttpDelete("{luotKhamId}/chi-dinh-dich-vu/{chiDinhDichVuId}")]
        public async Task<IActionResult> DeleteChiDinhDichVu(int luotKhamId, int chiDinhDichVuId)
        {
            var command = new XoaChiDinhDichVuCommand
            {
                LuotKhamId = luotKhamId,
                ChiDinhDichVuId = chiDinhDichVuId,
                DeletedBy = CurrentUserId
            };

            var result = await _mediator.Send(command);
            return Success(result);
        }

        /// <summary>
        /// Lấy chi tiết thông tin và kết quả của một chỉ định dịch vụ theo Id.
        /// </summary>
        [HttpGet("chi-dinh/{chiDinhId}/chi-tiet")]
        public async Task<IActionResult> GetChiDinhChiTiet(int chiDinhId)
        {
            var query = new LayChiTietChiDinhQuery { ChiDinhId = chiDinhId };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Tiếp nhận thực hiện chỉ định tại phòng chức năng (Xét nghiệm / CĐHA).
        /// </summary>
        [HttpPost("chi-dinh/{chiDinhId}/tiep-nhan")]
        public async Task<IActionResult> TiepNhanChiDinh(int chiDinhId, [FromBody] TiepNhanChiDinhRequest? request = null)
        {
            var command = new TiepNhanChiDinhCommand
            {
                ChiDinhId = chiDinhId,
                MaNguoiThucHien = request?.MaNguoiThucHien ?? CurrentUserId,
                UpdatedBy = CurrentUserId,
                GhiChu = request?.GhiChu
            };

            var result = await _mediator.Send(command);
            return Success(result);
        }

        /// <summary>
        /// Nhập kết quả trả về cho chỉ định dịch vụ cận lâm sàng.
        /// </summary>
        [HttpPost("chi-dinh/{chiDinhId}/nhap-ket-qua")]
        public async Task<IActionResult> NhapKetQuaChiDinh(int chiDinhId, [FromBody] NhapKetQuaChiDinhRequest request)
        {
            var command = new NhapKetQuaChiDinhCommand
            {
                ChiDinhId = chiDinhId,
                UpdatedBy = CurrentUserId,
                Data = request
            };

            var result = await _mediator.Send(command);
            return Success(result);
        }

        /// <summary>
        /// Hủy chỉ định dịch vụ kèm lý do hủy.
        /// </summary>
        [HttpPost("chi-dinh/{chiDinhId}/huy")]
        public async Task<IActionResult> HuyChiDinh(int chiDinhId, [FromBody] HuyChiDinhRequest? request = null)
        {
            var command = new HuyChiDinhCommand
            {
                ChiDinhId = chiDinhId,
                DeletedBy = CurrentUserId,
                LyDo = request?.LyDo
            };

            var result = await _mediator.Send(command);
            return Success(result);
        }
    }
}