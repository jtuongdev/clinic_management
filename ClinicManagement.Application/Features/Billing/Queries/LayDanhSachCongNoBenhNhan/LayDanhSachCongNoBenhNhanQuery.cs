using System;
using ClinicManagement.Application.DTOs.Billing;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayDanhSachCongNoBenhNhanQuery(
    int FacilityId = 0,
    string? Status = null,
    string? Keyword = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int PageIndex = 1,
    int PageSize = 20) : IRequest<DanhSachCongNoBenhNhanResponseDto>;
