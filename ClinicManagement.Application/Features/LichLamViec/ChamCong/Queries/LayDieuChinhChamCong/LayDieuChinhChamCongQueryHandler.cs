using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class LayDieuChinhChamCongQueryHandler : IRequestHandler<LayDieuChinhChamCongQuery, IReadOnlyList<AttendanceAdjustmentDto>>
{
    private readonly IChamCongRepository repository;
    public LayDieuChinhChamCongQueryHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<IReadOnlyList<AttendanceAdjustmentDto>> Handle(LayDieuChinhChamCongQuery r, CancellationToken ct)
    {
        TrangThaiDieuChinhChamCong? s = null;
        if (!string.IsNullOrWhiteSpace(r.Status) && Enum.TryParse(r.Status, true, out TrangThaiDieuChinhChamCong parsed))
            s = parsed;
        return (await repository.GetAdjustmentsAsync(r.FromDate, r.ToDate, s, ct)).Select(AnhXaChamCong.ToDto).ToList();
    }
}
