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
    [ApiController]
    [Route("api/admin")]
    public sealed class AdminSettingsController : BaseController
    {
        private readonly IClinicalGovernanceService _clinicalGovernanceService;

        public AdminSettingsController(IClinicalGovernanceService clinicalGovernanceService)
        {
            _clinicalGovernanceService = clinicalGovernanceService;
        }

        [HttpGet("roles")]
        [ClinicalAuthorize("settings", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.GetRoleMatrixAsync(cancellationToken);
            return Success(result);
        }

        [HttpPost("roles")]
        [ClinicalAuthorize("settings", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> SaveRole([FromBody] UpdateRolePermissionRequest request, CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.SaveRoleMatrixAsync(request, cancellationToken);
            return Success(result, "Cập nhật ma trận phân quyền thành công.");
        }

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

        [HttpPost("audit-logs")]
        [ClinicalAuthorize("audit", HanhDongQuyen.TAO, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> WriteAuditLog([FromBody] CreateEmrAuditLogRequest request, CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.WriteAuditLogAsync(request, cancellationToken);
            return Success(result, "Ghi nhật ký kiểm toán thành công.");
        }

        [HttpGet("integration-config")]
        [ClinicalAuthorize("settings", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> GetIntegrationConfig([FromQuery] string? danhMuc = null, CancellationToken cancellationToken = default)
        {
            var result = await _clinicalGovernanceService.GetIntegrationSettingsAsync(danhMuc, cancellationToken);
            return Success(result);
        }

        [HttpPost("integration-config")]
        [ClinicalAuthorize("settings", HanhDongQuyen.SUA, PhamViDuLieu.TOAN_HE_THONG)]
        public async Task<IActionResult> UpsertIntegrationConfig([FromBody] UpsertIntegrationSettingRequest request, CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.UpsertIntegrationSettingAsync(request, CurrentUserId, cancellationToken);
            return Success(result, "Lưu cấu hình tích hợp thành công.");
        }
    }
}
