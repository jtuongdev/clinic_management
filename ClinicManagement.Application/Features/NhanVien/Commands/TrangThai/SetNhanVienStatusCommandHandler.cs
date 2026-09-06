using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public class SetNhanVienStatusCommandHandler : IRequestHandler<SetNhanVienStatusCommand>
    {
        private readonly INhanVienRepository repository;

        public SetNhanVienStatusCommandHandler(INhanVienRepository repository)
        {
            this.repository = repository;
        }

        public async Task Handle(SetNhanVienStatusCommand command, CancellationToken cancellationToken)
        {
            var employee = await repository.GetByIdAsync(command.Id)
                ?? throw new KeyNotFoundException("Không tìm thấy nhân viên.");

            if (command.IsActive) employee.Activate();
            else employee.Deactivate();

            repository.Update(employee);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
