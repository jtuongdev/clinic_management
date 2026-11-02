using System;
using ClinicManagement.Application.DTOs.FinanceReports;
using MediatR;

namespace ClinicManagement.Application.Features.FinanceReports.Queries.XuatBaoCaoTaiChinh;

public class XuatBaoCaoTaiChinhQuery : IRequest<ExportFinancialReportDto>
{
    public string ReportType { get; set; } = "revenue"; // revenue | debts | cashflow
    public int? FacilityId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string Format { get; set; } = "csv";
}
