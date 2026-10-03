using System;
using ClinicManagement.Application.DTOs.FinanceReports;
using MediatR;

namespace ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoCongNoTongHop;

public sealed record LayBaoCaoCongNoTongHopQuery(
    int? FacilityId = null,
    DateTime? AsOfDate = null) : IRequest<BaoCaoCongNoResponseDto>;
