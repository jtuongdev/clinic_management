using System;
using ClinicManagement.Application.DTOs.FinanceReports;
using MediatR;

namespace ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoThuChi;

public sealed record LayBaoCaoThuChiLoiNhuanQuery(
    int? FacilityId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null) : IRequest<BaoCaoThuChiResponseDto>;
