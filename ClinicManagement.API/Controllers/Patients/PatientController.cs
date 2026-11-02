using ClinicManagement.API.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.Features.BenhNhan.Commands;
using ClinicManagement.Application.Features.BenhNhan.Queries;
using ClinicManagement.Application.Features.ThongKe.Queries;
using ClinicManagement.Domain.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Application.Common.Interfaces;
using System.Threading;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Hồ sơ Bệnh nhân (Patients) - Quản lý Hồ sơ hành chính, Tiền sử & Tìm kiếm
    /// Route: api/BenhNhan, api/patients
    /// Quyền: patient (XEM/TAO/SUA/XOA, CO_SO)
    /// </summary>
    [ApiController]
    [Route("api/BenhNhan")]
    [Route("api/patients")]
    [ClinicalAuthorize("patient", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
    public partial class BenhNhanController : BaseController
    {
        private readonly IMediator _mediator;

        public BenhNhanController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách hồ sơ bệnh nhân có phân trang, tìm kiếm và lọc bản ghi đã xóa
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? keyword = null,
            [FromQuery] bool includeDeleted = false)
        {
            // Giới hạn pageSize tối đa
            if (pageSize > 100) pageSize = 100;
            if (pageIndex < 1) pageIndex = 1;

            var query = new LayDanhSachBenhNhanPhanTrangQuery
            {
                PageIndex = pageIndex,
                PageSize = pageSize,
                Keyword = keyword,
                IncludeDeleted = includeDeleted
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy số liệu thống kê tổng số lượng bệnh nhân
        /// </summary>
        [HttpGet("count/benhnhan/thongke")]
        public async Task<IActionResult> GetThongKeBenhNhan()
        {
            var query = new LayThongKeBenhNhanQuery();
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Tạo mới hồ sơ bệnh nhân
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBenhNhanRequest request)
        {
            var command = new TaoBenhNhanCommand
            {
                Ho = request.Ho,
                Ten = request.Ten,
                NgaySinh = request.NgaySinh,
                GioiTinh = request.GioiTinh,
                DienThoai = request.DienThoai,
                Email = request.Email,
                SoCCCD = request.SoCCCD,
                DiaChi = request.DiaChi,
                NguoiLienHeTen = request.NguoiLienHeTen,
                NguoiLienHeDienThoai = request.NguoiLienHeDienThoai,
                MaPhongKham = request.MaPhongKham,
                MaCoSo = request.MaCoSo,
                MaKhoa = request.MaKhoa,
                MaBacSi = request.MaBacSi,
                BaoHiem = request.BaoHiem,
                TienSuBenhs = request.TienSuBenhs,

                CreatedBy = CurrentUserId
            };

            var result = await _mediator.Send(command);
            return Success(result, "Tạo bệnh nhân thành công");
        }

        /// <summary>
        /// Cập nhật thông tin hồ sơ bệnh nhân
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBenhNhanRequest request)
        {
            if (id != request.Id)
                return Failure("Id không khớp", 400);

            var command = new CapNhatBenhNhanCommand
            {
                Id = request.Id,
                Ho = request.Ho,
                Ten = request.Ten,
                NgaySinh = request.NgaySinh,
                GioiTinh = request.GioiTinh,
                DienThoai = request.DienThoai,
                Email = request.Email,
                DiaChi = request.DiaChi,
                NguoiLienHeTen = request.NguoiLienHeTen,
                NguoiLienHeDienThoai = request.NguoiLienHeDienThoai,
                UpdatedBy = CurrentUserId
            };

            var result = await _mediator.Send(command);
            return Success(result, "Cập nhật bệnh nhân thành công");
        }

        /// <summary>
        /// Xóa mềm hồ sơ bệnh nhân
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new XoaBenhNhanCommand { Id = id, DeletedBy = CurrentUserId };
            await _mediator.Send(command);
            return Success(true, "Xóa bệnh nhân thành công");
        }

        /// <summary>
        /// Lấy chi tiết hồ sơ bệnh nhân theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new LayBenhNhanTheoIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Tìm kiếm nhanh bệnh nhân theo từ khóa (Tên, SĐT, Email...)
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword = "")
        {
            var query = new TimKiemBenhNhanQuery { Keyword = keyword };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lọc danh sách bệnh nhân theo khoảng thời gian tiếp nhận
        /// </summary>
        [HttpGet("filter-by-date")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            var query = new LayBenhNhanTheoKhoangNgayQuery { FromDate = fromDate, ToDate = toDate };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách hồ sơ bệnh nhân đã bị xóa mềm
        /// </summary>
        [HttpGet("deleted")]
        public async Task<IActionResult> GetDeleted()
        {
            var query = new LayDanhSachBenhNhanDaXoaQuery();
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy toàn bộ tiền sử bệnh lý của bệnh nhân
        /// </summary>
        [HttpGet("{id}/tiensu")]
        public async Task<IActionResult> GetTienSu(int id)
        {
            var query = new LayTienSuTheoBenhNhanIdQuery { BenhNhanId = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy bản ghi tiền sử bệnh lý mới nhất của bệnh nhân
        /// </summary>
        [HttpGet("{id}/tiensu/latest")]
        public async Task<IActionResult> GetLatestTienSu(int id)
        {
            var query = new LayTienSuMoiNhatQuery { BenhNhanId = id };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Lấy danh mục các loại tiền sử bệnh lý
        /// </summary>
        [HttpGet("loai-tien-su")]
        public async Task<IActionResult> GetLoaiTienSu()
        {
            var query = new LayTuyChonLoaiTienSuQuery();
            var result = await _mediator.Send(query);
            return Success(result);
        }

        /// <summary>
        /// Quản trị viên đổi mật khẩu trực tiếp cho tài khoản bệnh nhân (không cần mật khẩu cũ hay OTP)
        /// </summary>
        [HttpPost("{id:int}/change-password")]
        [HttpPut("{id:int}/change-password")]
        [ClinicalAuthorize("patient", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
        public async Task<IActionResult> AdminChangePatientPassword(
            int id, 
            [FromBody] AdminChangePatientPasswordRequest request,
            [FromServices] IBenhNhanRepository benhNhanRepo,
            [FromServices] IPasswordHasher passwordHasher,
            [FromServices] ITokenLamMoiRepository tokenLamMoiRepo,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var command = new AdminDoiMatKhauBenhNhanCommand
                {
                    PatientId = id,
                    NewPassword = request.NewPassword,
                    UpdatedBy = CurrentUserId
                };

                // Khởi tạo handler trực tiếp từ các service đã có trong DI container
                // Tránh lỗi nạp thiếu assembly của MediatR khi chưa rebuild toàn bộ solution
                var handler = new AdminDoiMatKhauBenhNhanCommandHandler(benhNhanRepo, passwordHasher, tokenLamMoiRepo);
                var result = await handler.Handle(command, cancellationToken);
                return Success(result, "Đổi mật khẩu cho bệnh nhân thành công.");
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return Failure($"Đổi mật khẩu thất bại: {ex.Message}", 500);
            }
        }
    }
}