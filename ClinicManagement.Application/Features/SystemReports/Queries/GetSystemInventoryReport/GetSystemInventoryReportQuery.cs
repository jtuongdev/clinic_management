using ClinicManagement.Application.DTOs.SystemReports;
using MediatR;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemInventoryReport;

public sealed record GetSystemInventoryReportQuery(int? FacilityId = null) : IRequest<SystemReportsInventoryDto>;
