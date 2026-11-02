using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Nhân sự (Human Resources) - Quản lý Danh mục Ca trực và Ca làm việc.
    /// Bao gồm: tra cứu ca trực, thời gian bắt đầu/kết thúc, hệ số lương ca, thêm/sửa/xóa mềm ca trực.
    /// Route: /api/CaTruc, /api/shifts
    /// </summary>
    [ApiController]
    [Route("api/CaTruc")]
    [Route("api/shifts")]
    [ClinicalAuthorize("hr", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
    public class CaTrucController : BaseController
    {
        private readonly ClinicDbContext context;
        public CaTrucController(ClinicDbContext context) => this.context = context;

        /// <summary>
        /// Lấy danh sách toàn bộ ca trực trong hệ thống kèm thời gian và hệ số.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
            => Success(await context.CaTrucs.AsNoTracking().OrderBy(x => x.ThoiGianBatDau).Select(x => new CaTrucDto { Id = x.Id, MaLoaiCa = x.MaLoaiCa, TenCa = x.TenCa, ThoiGianBatDau = x.ThoiGianBatDau, ThoiGianKetThuc = x.ThoiGianKetThuc, SoGioLam = x.SoGioLam, HeSo = x.HeSo, MoTa = x.MoTa }).ToListAsync(cancellationToken));

        /// <summary>
        /// Tạo mới một ca trực (giờ bắt đầu, giờ kết thúc, hệ số lương).
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create(CreateCaTrucRequest request, CancellationToken cancellationToken)
        {
            var entity = new CaTruc { MaLoaiCa = request.MaLoaiCa, TenCa = request.TenCa.Trim(), ThoiGianBatDau = request.ThoiGianBatDau, ThoiGianKetThuc = request.ThoiGianKetThuc, HeSo = request.HeSo, MoTa = request.MoTa?.Trim() ?? string.Empty };
            entity.Validate();
            context.CaTrucs.Add(entity); await context.SaveChangesAsync(cancellationToken);
            return Success(entity.Id, "Tạo ca thành công.");
        }

        /// <summary>
        /// Cập nhật thông tin ca trực theo Id.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateCaTrucRequest request, CancellationToken cancellationToken)
        {
            var entity = await context.CaTrucs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (entity == null) return Failure("Không tìm thấy ca.", 404);
            entity.TenCa = request.TenCa.Trim(); entity.ThoiGianBatDau = request.ThoiGianBatDau; entity.ThoiGianKetThuc = request.ThoiGianKetThuc; entity.HeSo = request.HeSo; entity.MoTa = request.MoTa?.Trim() ?? string.Empty;
            entity.Validate(); await context.SaveChangesAsync(cancellationToken); return Success(entity.Id, "Cập nhật ca thành công.");
        }

        /// <summary>
        /// Xóa mềm một ca trực khỏi hệ thống.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var entity = await context.CaTrucs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (entity == null) return Failure("Không tìm thấy ca.", 404);
            entity.SoftDelete(CurrentUserId); await context.SaveChangesAsync(cancellationToken); return Success<object>(null, "Đã xóa ca.");
        }
    }
}
