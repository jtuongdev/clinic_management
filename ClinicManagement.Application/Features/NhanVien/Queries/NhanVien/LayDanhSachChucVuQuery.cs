using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public record LayDanhSachChucVuQuery : IRequest<IReadOnlyList<ChucVuDto>>;

    public class LayDanhSachChucVuQueryHandler : IRequestHandler<LayDanhSachChucVuQuery, IReadOnlyList<ChucVuDto>>
    {
        private readonly INhanVienRepository _repository;

        public LayDanhSachChucVuQueryHandler(INhanVienRepository repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<ChucVuDto>> Handle(LayDanhSachChucVuQuery request, CancellationToken cancellationToken)
        {
            var chucVus = await _repository.GetAllChucVusAsync(cancellationToken);
            return chucVus.Select(cv => new ChucVuDto
            {
                Id = cv.Id,
                TenChucVu = cv.TenChucVu,
                MoTa = cv.MoTa
            }).ToList();
        }
    }
}
