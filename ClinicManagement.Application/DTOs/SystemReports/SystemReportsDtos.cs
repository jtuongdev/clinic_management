using System;
using System.Collections.Generic;
using ClinicManagement.Application.DTOs.FinanceReports;
using ClinicManagement.Application.DTOs.ThongKe;

namespace ClinicManagement.Application.DTOs.SystemReports;

public class SystemReportsOverviewDto
{
    public SystemReportsOverviewKpisDto Kpis { get; set; } = new();
    public List<SystemReportsTrendDto> Trends { get; set; } = new();
    public List<SystemReportsDepartmentRevenueDto> DepartmentRevenue { get; set; } = new();
}

public class SystemReportsOverviewKpisDto
{
    public int TotalVisits { get; set; }
    public int CompletedVisits { get; set; }
    public int PendingVisits { get; set; }
    public int CanceledVisits { get; set; }
    public double CompletionRate { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal CollectedRevenue { get; set; }
    public decimal InsurancePaid { get; set; }
    public decimal PendingDebt { get; set; }
    public int TotalMedicines { get; set; }
    public int LowStockMedicines { get; set; }
    public int ExpiringBatches { get; set; }
    public decimal InventoryValue { get; set; }
    public int StaffCount { get; set; }
    public int DoctorsCount { get; set; }
}

public class SystemReportsTrendDto
{
    public string Date { get; set; } = string.Empty;
    public int Visits { get; set; }
    public int Completed { get; set; }
    public decimal Revenue { get; set; }
}

public class SystemReportsDepartmentRevenueDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class SystemReportsClinicalDto
{
    public BaoCaoLamSangDto BaseReport { get; set; } = new();
    public List<TopDiagnosisDto> TopDiagnoses { get; set; } = new();
    public List<ClsBreakdownDto> ClsBreakdown { get; set; } = new();
}

public class TopDiagnosisDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ClsBreakdownDto
{
    public string Type { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalAmount { get; set; }
}

public class SystemReportsFinanceDto
{
    public BaoCaoDoanhThuResponseDto Revenue { get; set; } = new();
    public BaoCaoThuChiResponseDto Cashflow { get; set; } = new();
    public List<PaymentMethodDistributionDto> PaymentMethods { get; set; } = new();
}

public class PaymentMethodDistributionDto
{
    public string Method { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Count { get; set; }
}

public class SystemReportsInventoryDto
{
    public SystemReportsInventoryKpisDto Kpis { get; set; } = new();
    public List<LowStockItemDto> LowStockList { get; set; } = new();
    public List<ExpiringBatchDto> ExpiringList { get; set; } = new();
    public List<TopDispensedMedicineDto> TopDispensed { get; set; } = new();
}

public class SystemReportsInventoryKpisDto
{
    public int TotalSkus { get; set; }
    public decimal TotalStockValue { get; set; }
    public int LowStockCount { get; set; }
    public int ExpiringCount { get; set; }
}

public class LowStockItemDto
{
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string ItemCode { get; set; } = string.Empty;
    public decimal CurrentStock { get; set; }
    public decimal MinStock { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Warehouse { get; set; } = string.Empty;
}

public class ExpiringBatchDto
{
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public decimal Stock { get; set; }
    public string Warehouse { get; set; } = string.Empty;
}

public class TopDispensedMedicineDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class SystemReportsProductivityDto
{
    public List<DoctorProductivityDto> DoctorRankings { get; set; } = new();
    public List<RoomUtilizationDto> RoomUtilization { get; set; } = new();
}

public class DoctorProductivityDto
{
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int TotalVisits { get; set; }
    public int CompletedVisits { get; set; }
    public int PrescriptionsCount { get; set; }
    public int ClsOrdersCount { get; set; }
    public decimal RevenueGenerated { get; set; }
}

public class RoomUtilizationDto
{
    public int RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int VisitsCount { get; set; }
}

public class ExportSystemReportDto
{
    public byte[] FileContents { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "text/csv; charset=utf-8";
    public string FileName { get; set; } = string.Empty;
}
