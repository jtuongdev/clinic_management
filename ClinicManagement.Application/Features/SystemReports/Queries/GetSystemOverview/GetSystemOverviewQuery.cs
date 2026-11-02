using System;
using ClinicManagement.Application.DTOs.SystemReports;
using MediatR;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemOverview;

public sealed record GetSystemOverviewQuery(
    int? FacilityId = null,
    int? DepartmentId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null) : IRequest<SystemReportsOverviewDto>;
