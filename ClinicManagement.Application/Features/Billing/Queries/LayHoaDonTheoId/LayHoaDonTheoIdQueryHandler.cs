using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayHoaDonTheoIdQueryHandler(IHoaDonRepository repository)
    : IRequestHandler<LayHoaDonTheoIdQuery, HoaDonDetailDto?>
{
    public async Task<HoaDonDetailDto?> Handle(LayHoaDonTheoIdQuery request, CancellationToken cancellationToken)
        => (await repository.GetByIdAsync(request.InvoiceId, cancellationToken)) is { } invoice
            ? BillingMapper.ToDetail(invoice)
            : null;
}
