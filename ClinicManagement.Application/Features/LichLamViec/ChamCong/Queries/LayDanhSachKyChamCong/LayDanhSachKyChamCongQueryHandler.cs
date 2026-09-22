using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class LayDanhSachKyChamCongQueryHandler : IRequestHandler<LayDanhSachKyChamCongQuery, IReadOnlyList<AttendancePeriodDto>>
{
    private readonly IChamCongRepository repository;
    public LayDanhSachKyChamCongQueryHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<IReadOnlyList<AttendancePeriodDto>> Handle(LayDanhSachKyChamCongQuery c, CancellationToken ct)
    {
        var periods = await repository.GetPeriodsAsync(ct);
        var result = new List<AttendancePeriodDto>();
        foreach (var period in periods)
            result.Add(AnhXaChamCong.ToDto(period, await repository.CountEmployeesInPeriodAsync(period.TuNgay, period.DenNgay, ct)));
        return result;
    }
}
