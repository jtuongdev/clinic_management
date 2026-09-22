using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayDanhSachHoaDonQuery(
    int FacilityId,
    DateTime? FromDate,
    DateTime? ToDate,
    TrangThaiHoaDon? Status,
    string? Keyword = null,
    int PageIndex = 1,
    int PageSize = 20) : IRequest<PagedResult<HoaDonListDto>>;
