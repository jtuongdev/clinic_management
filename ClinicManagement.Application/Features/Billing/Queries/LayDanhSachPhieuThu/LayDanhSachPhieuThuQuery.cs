using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.LuotKham;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayDanhSachPhieuThuQuery(int InvoiceId) : IRequest<IReadOnlyList<PhieuThuDto>>;
