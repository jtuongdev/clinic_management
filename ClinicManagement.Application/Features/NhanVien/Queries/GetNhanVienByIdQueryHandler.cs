using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class GetNhanVienByIdQueryHandler : IRequestHandler<GetNhanVienByIdQuery, NhanVienDetailDto?>
    {
        private readonly INhanVienRepository repository;

        public GetNhanVienByIdQueryHandler(INhanVienRepository repository)
        {
            this.repository = repository;
        }

        public async Task<NhanVienDetailDto?> Handle(GetNhanVienByIdQuery request, CancellationToken cancellationToken)
        {
            var employee = await repository.GetDetailByIdAsync(request.Id, cancellationToken);
            return employee == null ? null : NhanVienDtoMapper.ToDetail(employee);
        }
    }
}
