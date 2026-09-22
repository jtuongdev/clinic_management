using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class HuyHoaDonCommandHandler(IHoaDonRepository repository)
    : IRequestHandler<HuyHoaDonCommand, HoaDonDetailDto>
{
    public async Task<HoaDonDetailDto> Handle(
        HuyHoaDonCommand request,
        CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByIdAsync(request.InvoiceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy hóa đơn {request.InvoiceId}.");

        invoice.HuyHoaDon(request.Request.LyDoHuy);
        repository.Update(invoice);
        await repository.SaveChangesAsync(cancellationToken);

        return BillingMapper.ToDetail(invoice);
    }
}
