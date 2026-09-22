using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayHoaDonTheoLuotKhamQuery(int VisitId) : IRequest<HoaDonDetailDto?>;
