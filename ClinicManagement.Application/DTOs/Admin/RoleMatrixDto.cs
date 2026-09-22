using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.Admin
{
    public sealed record RolePermissionMatrixDto(
        int Id,
        string MaCode,
        string Ten,
        string MoTa,
        PhamViDuLieu PhamViDuLieu,
        Dictionary<string, List<HanhDongQuyen>> PhanQuyen);

    public sealed record UpdateRolePermissionRequest(
        int Id,
        string MaCode,
        string Ten,
        string MoTa,
        PhamViDuLieu PhamViDuLieu,
        Dictionary<string, List<HanhDongQuyen>> PhanQuyen);
}
