using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, IReadOnlyList<RoleDto>>
    {
        private readonly INhanVienRepository repository;

        public GetRolesQueryHandler(INhanVienRepository repository) => this.repository = repository;

        public async Task<IReadOnlyList<RoleDto>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
        {
            var roles = await repository.GetAllRolesAsync(cancellationToken);
            return roles.Select(role => new RoleDto
            {
                Id = role.Id,
                TenVaiTro = role.TenVaiTro,
                MoTa = role.MoTa
            }).ToList();
        }
    }

    public class GetEmployeePermissionsQueryHandler : IRequestHandler<GetEmployeePermissionsQuery, IReadOnlyList<PermissionDto>>
    {
        private readonly INhanVienRepository repository;

        public GetEmployeePermissionsQueryHandler(INhanVienRepository repository) => this.repository = repository;

        public async Task<IReadOnlyList<PermissionDto>> Handle(GetEmployeePermissionsQuery request, CancellationToken cancellationToken)
        {
            var permissions = await repository.GetPermissionsByUserIdAsync(request.EmployeeId);
            return permissions.Select(permission => new PermissionDto
            {
                Id = permission.Id,
                TenQuyen = permission.TenQuyen,
                MoTa = permission.MoTa
            }).ToList();
        }
    }
}
