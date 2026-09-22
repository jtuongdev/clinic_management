using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayCongNoBenhNhanQueryHandler(IHoaDonRepository repository)
    : IRequestHandler<LayCongNoBenhNhanQuery, IReadOnlyList<CongNoDto>>
{
    public async Task<IReadOnlyList<CongNoDto>> Handle(
        LayCongNoBenhNhanQuery request, CancellationToken cancellationToken)
        => (await repository.GetCongNoByBenhNhanAsync(request.PatientId, cancellationToken))
            .Select(debt => new CongNoDto
            {
                Id = debt.Id,
                MaBenhNhan = debt.MaBenhNhan,
                MaHoaDon = debt.MaHoaDon,
                SoTienNo = debt.SoTienNo,
                SoTienDaTra = debt.SoTienDaTra,
                SoTienConLai = debt.SoTienConLai,
                TrangThai = debt.TrangThai.ToString(),
                HanThanhToan = debt.HanThanhToan
            }).ToList();
}
