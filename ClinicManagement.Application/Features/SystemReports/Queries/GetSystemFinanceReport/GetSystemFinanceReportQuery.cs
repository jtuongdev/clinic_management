using System;
using ClinicManagement.Application.DTOs.SystemReports;
using MediatR;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemFinanceReport;

public sealed record GetSystemFinanceReportQuery(
    int? FacilityId = null,
    int? DepartmentId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? GroupBy = "day") : IRequest<SystemReportsFinanceDto>;
