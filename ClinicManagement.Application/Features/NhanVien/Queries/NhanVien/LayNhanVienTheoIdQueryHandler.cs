using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class LayNhanVienTheoIdQueryHandler : IRequestHandler<LayNhanVienTheoIdQuery, NhanVienDetailDto?>
    {
        private readonly INhanVienRepository repository;

        public LayNhanVienTheoIdQueryHandler(INhanVienRepository repository)
        {
            this.repository = repository;
        }

        public async Task<NhanVienDetailDto?> Handle(LayNhanVienTheoIdQuery request, CancellationToken cancellationToken)
        {
            var employee = await repository.GetDetailByIdAsync(request.Id, cancellationToken);
            return employee == null ? null : AnhXaNhanVien.ToDetail(employee);
        }
    }
}
