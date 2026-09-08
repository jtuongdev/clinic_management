namespace ClinicManagement.Application.DTOs.Kho;

public sealed record ExportItem(int ItemId, decimal Quantity, string? Unit = null, decimal? UnitPrice = null);
