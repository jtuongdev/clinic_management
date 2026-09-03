using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class LoaiCaController : BaseController
    {
        private readonly ClinicDbContext context;
        public LoaiCaController(ClinicDbContext context) => this.context = context;

        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
            => Success(await context.LoaiCas.AsNoTracking().OrderBy(x => x.TenLoai).Select(x => new LoaiCaDto { Id = x.Id, Ma = x.Ma, TenLoai = x.TenLoai, MoTa = x.MoTa }).ToListAsync(cancellationToken));

        [HttpPost]
        public async Task<IActionResult> Create(LoaiCaDto request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Ma) || string.IsNullOrWhiteSpace(request.TenLoai)) return Failure("Mã và tên loại ca không được để trống.");
            if (await context.LoaiCas.AnyAsync(x => x.Ma == request.Ma.Trim(), cancellationToken)) return Failure("Mã loại ca đã tồn tại.");
            var entity = new Domain.Identity.LoaiCa { Ma = request.Ma.Trim(), TenLoai = request.TenLoai.Trim(), MoTa = request.MoTa?.Trim() ?? string.Empty };
            context.LoaiCas.Add(entity); await context.SaveChangesAsync(cancellationToken); return Success(entity.Id, "Tạo loại ca thành công.");
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, LoaiCaDto request, CancellationToken cancellationToken)
        {
            var entity = await context.LoaiCas.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (entity == null) return Failure("Không tìm thấy loại ca.", 404);
            entity.Ma = request.Ma.Trim(); entity.TenLoai = request.TenLoai.Trim(); entity.MoTa = request.MoTa?.Trim() ?? string.Empty; await context.SaveChangesAsync(cancellationToken); return Success(entity.Id, "Cập nhật loại ca thành công.");
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var entity = await context.LoaiCas.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (entity == null) return Failure("Không tìm thấy loại ca.", 404);
            entity.SoftDelete(CurrentUserId); await context.SaveChangesAsync(cancellationToken); return Success<object>(null, "Đã xóa loại ca.");
        }
    }
}
