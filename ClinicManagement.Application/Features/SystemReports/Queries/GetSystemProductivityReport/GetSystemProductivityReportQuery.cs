using System;
using ClinicManagement.Application.DTOs.SystemReports;
using MediatR;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemProductivityReport;

public sealed record GetSystemProductivityReportQuery(
    int? FacilityId = null,
    int? DepartmentId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null) : IRequest<SystemReportsProductivityDto>;
