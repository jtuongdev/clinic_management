using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Application.Features.NhanVien.Commands;
using ClinicManagement.Application.Features.NhanVien.Queries;
using System;
using System.Threading.Tasks;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
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
            var result = await _mediator.Send(new GetNhanViensPagedQuery
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

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetNhanVienByIdQuery(id), cancellationToken);
            return result == null ? Failure("Không tìm thấy nhân viên.", 404) : Success(result);
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
        {
            return Success(await _mediator.Send(new GetRolesQuery(), cancellationToken));
        }

        [HttpGet("{id:int}/permissions")]
        public async Task<IActionResult> GetPermissions(int id, CancellationToken cancellationToken)
        {
            return Success(await _mediator.Send(new GetEmployeePermissionsQuery(id), cancellationToken));
        }

        [HttpPut("{id:int}/roles")]
        public async Task<IActionResult> UpdateRoles(
            int id,
            [FromBody] UpdateEmployeeRolesRequest request,
            CancellationToken cancellationToken)
        {
            await _mediator.Send(new UpdateEmployeeRolesCommand(id, request), cancellationToken);
            return Success<object>(null, "Cập nhật vai trò nhân viên thành công.");
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateNhanVienRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateNhanVienCommand(request), cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<object>.Ok(result, "Tạo nhân viên thành công."));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateNhanVienRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateNhanVienCommand(id, request), cancellationToken);
            return Success(result, "Cập nhật nhân viên thành công.");
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> SetStatus(
            int id,
            [FromBody] SetNhanVienStatusCommand command,
            CancellationToken cancellationToken)
        {
            if (command.Id != id)
                return Failure("Id trong request không khớp với URL.");

            await _mediator.Send(command, cancellationToken);
            return Success<object>(null, "Cập nhật trạng thái nhân viên thành công.");
        }

        [HttpGet("bac-si")]
        public async Task<IActionResult> GetBacSiByKhoa(
            [FromQuery] int maKhoa,
            [FromQuery] int maCoSo,
            CancellationToken cancellationToken = default)
        {
            var query = new GetBacSiByKhoaQuery
            {
                MaKhoa = maKhoa,
                MaCoSo = maCoSo
            };

            var result = await _mediator.Send(query, cancellationToken);

            return Success(result);
        }
        [HttpGet("bac-si-truc")]
        public async Task<IActionResult> GetBacSiTruc(
            [FromQuery] int? maCoSo = null,
            [FromQuery] int? maKhoa = null)
        {
            var query = new GetBacSiTrucQuery
            {
                MaCoSo = maCoSo,
                MaKhoa = maKhoa
            };
            var result = await _mediator.Send(query);
            return Success(result);
        }
    }
}