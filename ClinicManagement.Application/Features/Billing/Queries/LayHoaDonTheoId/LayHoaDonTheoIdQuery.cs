using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayHoaDonTheoIdQuery(int InvoiceId) : IRequest<HoaDonDetailDto?>;
