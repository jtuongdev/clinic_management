using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public class UpdateEmployeeRolesCommandHandler : IRequestHandler<UpdateEmployeeRolesCommand>
    {
        private readonly INhanVienRepository repository;

        public UpdateEmployeeRolesCommandHandler(INhanVienRepository repository) => this.repository = repository;

        public async Task Handle(UpdateEmployeeRolesCommand command, CancellationToken cancellationToken)
        {
            var employee = await repository.GetDetailForUpdateAsync(command.EmployeeId, cancellationToken)
                ?? throw new KeyNotFoundException("Không tìm thấy nhân viên.");
            var request = command.Request;
            var startDate = request.NgayBatDau.Date;
            var endDate = request.NgayKetThuc?.Date;

            if (endDate.HasValue && endDate.Value < startDate)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");

            var roleIds = request.RoleIds.Distinct().ToList();
            var roles = await repository.GetRolesByIdsAsync(roleIds, cancellationToken);
            if (roles.Count != roleIds.Count)
                throw new KeyNotFoundException("Một hoặc nhiều vai trò không tồn tại.");

            employee.ReplaceRoles(roles, startDate, endDate);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
