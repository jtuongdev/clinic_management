using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayHoaDonTheoLuotKhamQueryHandler(IHoaDonRepository repository)
    : IRequestHandler<LayHoaDonTheoLuotKhamQuery, HoaDonDetailDto?>
{
    public async Task<HoaDonDetailDto?> Handle(LayHoaDonTheoLuotKhamQuery request, CancellationToken cancellationToken)
        => (await repository.GetByLuotKhamAsync(request.VisitId, cancellationToken)) is { } invoice
            ? BillingMapper.ToDetail(invoice)
            : null;
}
