using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record RecordInvoicePaymentCommand(
    int InvoiceId,
    RecordPaymentRequest Request,
    int UserId) : IRequest<HoaDonDetailDto>;

public sealed record ApplyInvoiceInsuranceCommand(
    int InvoiceId,
    ApplyInsuranceRequest Request,
    int UserId) : IRequest<HoaDonDetailDto>;

public sealed record CancelInvoiceCommand(
    int InvoiceId,
    CancelInvoiceRequest Request,
    int UserId) : IRequest<HoaDonDetailDto>;

public sealed class RecordInvoicePaymentHandler(IHoaDonRepository repository)
    : IRequestHandler<RecordInvoicePaymentCommand, HoaDonDetailDto>
{
    public async Task<HoaDonDetailDto> Handle(
        RecordInvoicePaymentCommand request, CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByIdAsync(request.InvoiceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy hóa đơn {request.InvoiceId}.");

        invoice.RecordPayment(request.Request.SoTien, request.Request.PhuongThuc, request.UserId);
        if (!string.IsNullOrWhiteSpace(request.Request.GhiChu) &&
            invoice.PhieuThus.LastOrDefault() is { } payment)
        {
            payment.GhiChu = request.Request.GhiChu;
        }

        await repository.SaveChangesAsync(cancellationToken);
        return BillingMapper.ToDetail(invoice);
    }
}

public sealed class ApplyInvoiceInsuranceHandler(IHoaDonRepository repository)
    : IRequestHandler<ApplyInvoiceInsuranceCommand, HoaDonDetailDto>
{
    public async Task<HoaDonDetailDto> Handle(
        ApplyInvoiceInsuranceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByIdAsync(request.InvoiceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy hóa đơn {request.InvoiceId}.");
        invoice.ApplyInsurance(request.Request.SoTienBaoHiem);
        await repository.SaveChangesAsync(cancellationToken);
        return BillingMapper.ToDetail(invoice);
    }
}

public sealed class CancelInvoiceHandler(IHoaDonRepository repository)
    : IRequestHandler<CancelInvoiceCommand, HoaDonDetailDto>
{
    public async Task<HoaDonDetailDto> Handle(
        CancelInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByIdAsync(request.InvoiceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy hóa đơn {request.InvoiceId}.");
        invoice.HuyHoaDon(request.Request.LyDoHuy);

        await repository.SaveChangesAsync(cancellationToken);
        return BillingMapper.ToDetail(invoice);
    }
}
