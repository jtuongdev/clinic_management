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

    public sealed record CreateRoleRequest(
        string Ten,
        string? MaCode,
        string? MoTa,
        PhamViDuLieu PhamViDuLieu,
        Dictionary<string, List<HanhDongQuyen>>? PhanQuyen);

    public sealed record UpdateFeatureMatrixRequest(
        string PhanHe,
        Dictionary<int, List<HanhDongQuyen>> RolePermissions);
}
