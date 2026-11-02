using System;
using ClinicManagement.Application.DTOs.SystemReports;
using MediatR;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemClinicalReport;

public sealed record GetSystemClinicalReportQuery(
    int? FacilityId = null,
    int? DepartmentId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? Shift = null) : IRequest<SystemReportsClinicalDto>;
