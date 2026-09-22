using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class LayDieuChinhLichLamViecHandler : IRequestHandler<LayDieuChinhLichLamViecQuery, IReadOnlyList<LichLamViecDieuChinhDto>>
{
    private readonly ILichLamViecRepository repository;
    public LayDieuChinhLichLamViecHandler(ILichLamViecRepository repository) => this.repository = repository;

    public async Task<IReadOnlyList<LichLamViecDieuChinhDto>> Handle(LayDieuChinhLichLamViecQuery request, CancellationToken cancellationToken)
        => (await repository.GetAdjustmentsAsync(request.ScheduleId, cancellationToken))
            .Select(item => new LichLamViecDieuChinhDto
            {
                Id = item.Id,
                MaLichLamViec = item.MaLichLamViec,
                CaCu = item.CaCu,
                CaMoi = item.CaMoi,
                PhongCu = item.PhongCu,
                PhongMoi = item.PhongMoi,
                TrangThaiCu = item.TrangThaiCu,
                TrangThaiMoi = item.TrangThaiMoi,
                LyDo = item.LyDo,
                NguoiThucHien = item.NguoiThucHien,
                ThoiDiem = item.ThoiDiem
            }).ToList();
}
