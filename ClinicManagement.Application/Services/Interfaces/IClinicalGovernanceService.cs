using ClinicManagement.Application.DTOs.Admin;
using ClinicManagement.Application.DTOs.Medical;
using ClinicManagement.Application.DTOs.System;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.Services.Interfaces
{
    public interface IClinicalGovernanceService
    {
        Task<IReadOnlyList<RolePermissionMatrixDto>> GetRoleMatrixAsync(CancellationToken cancellationToken = default);
        Task<RolePermissionMatrixDto> SaveRoleMatrixAsync(UpdateRolePermissionRequest request, CancellationToken cancellationToken = default);
        Task<bool> HasPermissionAsync(int maNguoiDung, string phanHe, string hanhDong, PhamViDuLieu phamViDuLieu = PhamViDuLieu.KHOA_PHONG, IReadOnlyList<string>? userRoles = null, CancellationToken cancellationToken = default);
        Task<DrugInteractionCheckResponse> CheckDrugInteractionAsync(int maBenhNhan, IEnumerable<int> medicineIds, string? note = null, CancellationToken cancellationToken = default);
        Task<ClinicalRecordValidationResult> ValidateClinicalRecordCompletionAsync(int maHoSo, CancellationToken cancellationToken = default);
        Task<LockEmrResponse> LockEmrAsync(int maHoSo, int maNguoiDung, string? lyDo, string? chuKySo, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<EmrAuditLogDto>> GetAuditLogsAsync(
            int? maBenhNhan = null,
            int? maNguoiDung = null,
            string? hanhDong = null,
            string? phanHe = null,
            DateTime? from = null,
            DateTime? to = null,
            int pageIndex = 1,
            int pageSize = 20,
            CancellationToken cancellationToken = default);
        Task<EmrAuditLogDto> WriteAuditLogAsync(CreateEmrAuditLogRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<IntegrationSettingDto>> GetIntegrationSettingsAsync(string? danhMuc = null, CancellationToken cancellationToken = default);
        Task<IntegrationSettingDto> UpsertIntegrationSettingAsync(UpsertIntegrationSettingRequest request, int? nguoiThucHien = null, CancellationToken cancellationToken = default);
    }
}
