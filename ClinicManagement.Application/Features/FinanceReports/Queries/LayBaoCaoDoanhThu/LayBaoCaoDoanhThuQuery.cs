using System;
using ClinicManagement.Application.DTOs.FinanceReports;
using MediatR;

namespace ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoDoanhThu;

public sealed record LayBaoCaoDoanhThuQuery(
    int? FacilityId = null,
    int? DepartmentId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? GroupBy = "day") : IRequest<BaoCaoDoanhThuResponseDto>;
