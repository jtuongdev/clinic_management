using System;
using ClinicManagement.Application.DTOs.Billing;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record LayDanhSachCongNoNhaCungCapQuery(
    int FacilityId = 0,
    int? SupplierId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? Status = null,
    string? Keyword = null,
    int PageIndex = 1,
    int PageSize = 20) : IRequest<DanhSachCongNoNhaCungCapResponseDto>;
