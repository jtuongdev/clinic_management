using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class ApDungBaoHiemHoaDonCommandHandler(IHoaDonRepository repository)
    : IRequestHandler<ApDungBaoHiemHoaDonCommand, HoaDonDetailDto>
{
    public async Task<HoaDonDetailDto> Handle(
        ApDungBaoHiemHoaDonCommand request,
        CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByIdAsync(request.InvoiceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy hóa đơn {request.InvoiceId}.");

        invoice.ApplyInsurance(request.Request.SoTienBaoHiem);
        repository.Update(invoice);
        await repository.SaveChangesAsync(cancellationToken);

        return BillingMapper.ToDetail(invoice);
    }
}
