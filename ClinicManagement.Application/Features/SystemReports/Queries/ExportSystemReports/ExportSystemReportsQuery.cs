using System;
using ClinicManagement.Application.DTOs.SystemReports;
using MediatR;

namespace ClinicManagement.Application.Features.SystemReports.Queries.ExportSystemReports;

public sealed record ExportSystemReportsQuery(
    string Tab = "overview",
    int? FacilityId = null,
    int? DepartmentId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null) : IRequest<ExportSystemReportDto>;
