using System;

namespace ClinicManagement.Application.DTOs.FinanceReports;

public class ExportFinancialReportDto
{
    public byte[] FileContent { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "text/csv; charset=utf-8";
    public string FileName { get; set; } = string.Empty;
}
