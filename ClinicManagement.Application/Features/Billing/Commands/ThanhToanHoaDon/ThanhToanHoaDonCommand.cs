using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record ThanhToanHoaDonCommand(
    int InvoiceId,
    RecordPaymentRequest Request,
    int UserId) : IRequest<HoaDonDetailDto>;
