using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class ThanhToanHoaDonCommandHandler(IHoaDonRepository repository)
    : IRequestHandler<ThanhToanHoaDonCommand, HoaDonDetailDto>
{
    public async Task<HoaDonDetailDto> Handle(
        ThanhToanHoaDonCommand request,
        CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByIdAsync(request.InvoiceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy hóa đơn {request.InvoiceId}.");

        var collectorId = request.UserId > 0 ? request.UserId : (invoice.CreatedBy ?? 1);

        invoice.RecordPayment(request.Request.SoTien, request.Request.PhuongThuc, collectorId, request.Request.GhiChu);
        repository.Update(invoice);
        await repository.SaveChangesAsync(cancellationToken);

        return BillingMapper.ToDetail(invoice);
    }
}
