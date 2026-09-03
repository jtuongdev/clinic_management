using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public record GetRolesQuery : IRequest<IReadOnlyList<RoleDto>>;
    public record GetEmployeePermissionsQuery(int EmployeeId) : IRequest<IReadOnlyList<PermissionDto>>;
}
