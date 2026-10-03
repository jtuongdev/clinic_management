using ClinicManagement.API.Authorization;
using ClinicManagement.API.Extensions;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Application.Features.NhanVien.Commands;
using ClinicManagement.Application.Features.NhanVien.Queries;
using ClinicManagement.Application.Features.NhanVien.Queries.LayDanhSachNhanVienLookup;
using System;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ClinicalAuthorize("hr", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
    public class NhanVienController : BaseController
    {
        private readonly IMediator _mediator;

        public NhanVienController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged(
            [FromQuery] string? keyword = null,
            [FromQuery] int? maChucVu = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int? maKhoa = null,
            [FromQuery] DateTime? ngay = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new LayDanhSachNhanVienPhanTrangQuery
            {
                Keyword = keyword,
                MaChucVu = maChucVu,
                IsActive = isActive,
                MaKhoa = maKhoa,
                Ngay = ngay,
                PageIndex = pageIndex,
                PageSize = pageSize
            }, cancellationToken);

            return Success(result);
        }

        /// <summary>
        /// Lấy danh sách rút gọn nhân viên cho Dropdown / Lookup / Bộ lọc
        /// </summary>
        [HttpGet("lookup")]
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetLookup(
            [FromQuery] int? maKhoa = null,
            [FromQuery] string? chucVu = null,
            [FromQuery] int? maChucVu = null,
            [FromQuery] int? maCoSo = null,
            [FromQuery] string? keyword = null,
            [FromQuery] bool? isActive = true,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new LayDanhSachNhanVienLookupQuery
            {
                MaKhoa = maKhoa,
                ChucVu = chucVu,
                MaChucVu = maChucVu,
                MaCoSo = maCoSo,
                Keyword = keyword,
                IsActive = isActive
            }, cancellationToken);

            return Success(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new LayNhanVienTheoIdQuery(id), cancellationToken);
            return result == null ? Failure("Không tìm thấy nhân viên.", 404) : Success(result);
        }

        [HttpGet("positions")]
        [HttpGet("chuc-vu")]
        public async Task<IActionResult> GetChucVus(CancellationToken cancellationToken)
        {
            return Success(await _mediator.Send(new LayDanhSachChucVuQuery(), cancellationToken));
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
        {
            return Success(await _mediator.Send(new LayDanhSachVaiTroQuery(), cancellationToken));
        }

        [HttpGet("{id:int}/permissions")]
        public async Task<IActionResult> GetPermissions(int id, CancellationToken cancellationToken)
        {
            return Success(await _mediator.Send(new LayQuyenNhanVienQuery(id), cancellationToken));
        }

        [HttpPut("{id:int}/roles")]
        public async Task<IActionResult> UpdateRoles(
            int id,
            [FromBody] UpdateEmployeeRolesRequest request,
            CancellationToken cancellationToken)
        {
            await _mediator.Send(new CapNhatVaiTroNhanVienCommand(id, request), cancellationToken);
            return Success<object>(null, "Cập nhật vai trò nhân viên thành công.");
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateNhanVienRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new TaoNhanVienCommand(request), cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<object>.Ok(result, "Tạo nhân viên thành công."));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateNhanVienRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CapNhatNhanVienCommand(id, request), cancellationToken);
            return Success(result, "Cập nhật nhân viên thành công.");
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> SetStatus(
            int id,
            [FromBody] CapNhatTrangThaiNhanVienCommand command,
            CancellationToken cancellationToken)
        {
            if (command.Id != id)
                return Failure("Id trong request không khớp với URL.");

            await _mediator.Send(command, cancellationToken);
            return Success<object>(null, "Cập nhật trạng thái nhân viên thành công.");
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(
            int id,
            [FromBody] DeleteEmployeeRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null || request.NgayNghiViec == default)
                return Failure("Ngày nghỉ việc là bắt buộc.");

            var result = await _mediator.Send(
                new XoaMemNhanVienCommand(id, request.NgayNghiViec, request.LyDo, CurrentUserId),
                cancellationToken);
            return Success(result, "Đã xoá mềm nhân viên và thu hồi các quyền liên quan.");
        }

        [HttpGet("bac-si")]
        public async Task<IActionResult> GetBacSiByKhoa(
            [FromQuery] int maKhoa,
            [FromQuery] int? maCoSo = null,
            CancellationToken cancellationToken = default)
        {
            var coSoId = (maCoSo.HasValue && maCoSo.Value > 0)
                ? maCoSo.Value
                : (User.GetCoSoId() > 0 ? User.GetCoSoId() : 1);

            var query = new LayBacSiTheoKhoaQuery
            {
                MaKhoa = maKhoa,
                MaCoSo = coSoId
            };

            var result = await _mediator.Send(query, cancellationToken);

            return Success(result);
        }
        [HttpGet("bac-si-truc")]
        public async Task<IActionResult> GetBacSiTruc(
            [FromQuery] int? maCoSo = null,
            [FromQuery] int? maKhoa = null)
        {
            var query = new LayBacSiTrucQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }

        public sealed record DeleteEmployeeRequest(DateTime NgayNghiViec, string LyDo);
    }
}