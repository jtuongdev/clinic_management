using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class LayChamCongQueryHandler : IRequestHandler<LayChamCongQuery, IReadOnlyList<ChamCongDto>>
{
    private readonly IChamCongRepository repository;
    public LayChamCongQueryHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<IReadOnlyList<ChamCongDto>> Handle(LayChamCongQuery request, CancellationToken cancellationToken)
    {
        var items = await repository.GetByDateRangeAsync(request.FromDate, request.ToDate, request.MaNhanVien, request.MaKhoa, cancellationToken);
        return items.Select(AnhXaChamCong.ToDto).ToList();
    }
}
