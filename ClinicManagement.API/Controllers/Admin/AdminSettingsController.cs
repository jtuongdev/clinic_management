using ClinicManagement.Application.DTOs.Admin;
using ClinicManagement.Application.DTOs.System;
using ClinicManagement.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using System.Globalization;
using System.Text;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Quản trị (Admin) - Cấu hình Hệ thống, Phân quyền & Nhật ký Kiểm toán
    /// Quản lý ma trận vai trò quyền hạn, nhật ký hoạt động (Audit log) và cấu hình tích hợp.
    /// Route: api/admin
    /// </summary>
    [ApiController]
    [Route("api/admin")]
    public sealed class AdminSettingsController : BaseController
    {
        private readonly IClinicalGovernanceService _clinicalGovernanceService;

        public AdminSettingsController(IClinicalGovernanceService clinicalGovernanceService)
        {
            _clinicalGovernanceService = clinicalGovernanceService;
        }

        /// <summary>
        /// Lấy ma trận phân quyền vai trò (Role Matrix) toàn hệ thống
        /// </summary>
        [HttpGet("roles")]
        [ClinicalAuthorize("settings", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.GetRoleMatrixAsync(cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Cập nhật ma trận quyền hạn cho vai trò
        /// </summary>
        [HttpPost("roles")]
        [ClinicalAuthorize("settings", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> SaveRole([FromBody] UpdateRolePermissionRequest request, CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
            {
                var createReq = new CreateRoleRequest(request.Ten, request.MaCode, request.MoTa, request.PhamViDuLieu, request.PhanQuyen);
                var created = await _clinicalGovernanceService.CreateRoleAsync(createReq, cancellationToken);
                return Success(created, "Thêm mới vai trò thành công.");
            }

            var result = await _clinicalGovernanceService.SaveRoleMatrixAsync(request, cancellationToken);
            return Success(result, "Cập nhật ma trận phân quyền thành công.");
        }

        /// <summary>
        /// Tạo vai trò người dùng mới
        /// </summary>
        [HttpPost("roles/create")]
        [ClinicalAuthorize("settings", HanhDongQuyen.TAO, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request, CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.CreateRoleAsync(request, cancellationToken);
            return Success(result, "Thêm mới vai trò thành công.");
        }

        /// <summary>
        /// Xóa vai trò người dùng theo ID
        /// </summary>
        [HttpDelete("roles/{id:int}")]
        [ClinicalAuthorize("settings", HanhDongQuyen.XOA, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> DeleteRole([FromRoute] int id, CancellationToken cancellationToken)
        {
            await _clinicalGovernanceService.DeleteRoleAsync(id, cancellationToken);
            return Success(true, "Xóa vai trò thành công.");
        }

        /// <summary>
        /// Cập nhật ma trận phân quyền theo từng chức năng chi tiết
        /// </summary>
        [HttpPost("roles/feature")]
        [ClinicalAuthorize("settings", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> SaveFeaturePermissions([FromBody] UpdateFeatureMatrixRequest request, CancellationToken cancellationToken)
        {
            await _clinicalGovernanceService.SaveFeaturePermissionsAsync(request, cancellationToken);
            return Success(true, "Cập nhật phân quyền theo chức năng thành công.");
        }

        /// <summary>
        /// Lấy danh sách nhật ký kiểm toán (Audit Logs) có phân trang và bộ lọc
        /// </summary>
        [HttpGet("audit-logs")]
        [ClinicalAuthorize("audit", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int? maBenhNhan = null,
            [FromQuery] int? maNguoiDung = null,
            [FromQuery] string? hanhDong = null,
            [FromQuery] string? phanHe = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var result = await _clinicalGovernanceService.GetAuditLogsAsync(
                maBenhNhan,
                maNguoiDung,
                hanhDong, phanHe,
                from,
                to,
                pageIndex,
                pageSize,
                cancellationToken);

            return Success(result);
        }

        /// <summary>
        /// Xuất danh sách nhật ký kiểm toán ra file CSV
        /// </summary>
        [HttpGet("audit-logs/export")]
        [ClinicalAuthorize("audit", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> ExportAuditLogs(
            [FromQuery] int? maBenhNhan = null,
            [FromQuery] int? maNguoiDung = null,
            [FromQuery] string? hanhDong = null,
            [FromQuery] string? phanHe = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken cancellationToken = default)
        {
            var rows = await _clinicalGovernanceService.GetAuditLogsAsync(
                maBenhNhan, maNguoiDung, hanhDong, phanHe, from, to, 1, 10000, cancellationToken);
            var csv = new StringBuilder();
            csv.AppendLine("Id,MaBenhNhan,MaHoSo,MaNguoiDung,HanhDong,PhanHe,DiaChiIp,ThoiGian,TrangThai,ChiTiet");
            foreach (var row in rows)
            {
                csv.AppendLine(string.Join(",", new[]
                {
                    row.Id.ToString(CultureInfo.InvariantCulture),
                    row.MaBenhNhan.ToString(CultureInfo.InvariantCulture),
                    row.MaHoSo.ToString(CultureInfo.InvariantCulture),
                    row.MaNguoiDung.ToString(CultureInfo.InvariantCulture),
                    Csv(row.HanhDong), Csv(row.PhanHe), Csv(row.DiaChiIp),
                    row.ThoiGian.ToString("O", CultureInfo.InvariantCulture),
                    Csv(row.TrangThai), Csv(row.ChiTiet)
                }));
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv; charset=utf-8",
                $"emr-audit-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
        }

        private static string Csv(string? value)
            => $"\"{(value ?? string.Empty).Replace("\"", "\"\"")}\"";

        /// <summary>
        /// Ghi nhận nhật ký kiểm toán mới
        /// </summary>
        [HttpPost("audit-logs")]
        [ClinicalAuthorize("audit", HanhDongQuyen.TAO, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> WriteAuditLog([FromBody] CreateEmrAuditLogRequest request, CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.WriteAuditLogAsync(request, cancellationToken);
            return Success(result, "Ghi nhật ký kiểm toán thành công.");
        }

        /// <summary>
        /// Lấy cấu hình tham số tích hợp hệ thống
        /// </summary>
        [HttpGet("integration-config")]
        [ClinicalAuthorize("settings", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> GetIntegrationConfig([FromQuery] string? danhMuc = null, CancellationToken cancellationToken = default)
        {
            var result = await _clinicalGovernanceService.GetIntegrationSettingsAsync(danhMuc, cancellationToken);
            return Success(result);
        }

        /// <summary>
        /// Tạo mới hoặc cập nhật cấu hình tham số tích hợp
        /// </summary>
        [HttpPost("integration-config")]
        [ClinicalAuthorize("settings", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> UpsertIntegrationConfig([FromBody] UpsertIntegrationSettingRequest request, CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.UpsertIntegrationSettingAsync(request, CurrentUserId, cancellationToken);
            return Success(result, "Lưu cấu hình tích hợp thành công.");
        }
    }
}
