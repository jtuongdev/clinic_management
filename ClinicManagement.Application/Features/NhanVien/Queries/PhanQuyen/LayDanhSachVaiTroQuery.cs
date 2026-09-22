using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public record LayDanhSachVaiTroQuery : IRequest<IReadOnlyList<RoleDto>>;
    public record LayQuyenNhanVienQuery(int EmployeeId) : IRequest<IReadOnlyList<PermissionDto>>;
}
