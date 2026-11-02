using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class LayDanhSachVaiTroQueryHandler : IRequestHandler<LayDanhSachVaiTroQuery, IReadOnlyList<RoleDto>>
    {
        private readonly INhanVienRepository repository;

        public LayDanhSachVaiTroQueryHandler(INhanVienRepository repository) => this.repository = repository;

        public async Task<IReadOnlyList<RoleDto>> Handle(LayDanhSachVaiTroQuery request, CancellationToken cancellationToken)
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

    public class LayQuyenNhanVienQueryHandler : IRequestHandler<LayQuyenNhanVienQuery, IReadOnlyList<PermissionDto>>
    {
        private readonly INhanVienRepository repository;

        public LayQuyenNhanVienQueryHandler(INhanVienRepository repository) => this.repository = repository;

        public async Task<IReadOnlyList<PermissionDto>> Handle(LayQuyenNhanVienQuery request, CancellationToken cancellationToken)
        {
            var permissions = await repository.GetPermissionsByUserIdAsync(request.EmployeeId);
            return permissions.Select(permission => new PermissionDto
            {
                Id = permission.Id,
                TenQuyen = $"{permission.PhanHe}:{permission.HanhDong}",
                MoTa = $"Quyền {permission.HanhDong} phân hệ {permission.PhanHe} (Phạm vi: {permission.PhamViDuLieu})"
            }).ToList();
        }
    }
}
