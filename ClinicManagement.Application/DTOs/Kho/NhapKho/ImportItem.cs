namespace ClinicManagement.Application.DTOs.Kho;

public sealed record ImportItem(int ItemId, decimal Quantity, decimal PurchasePrice, string BatchNumber, DateTime? ExpiryDate, string? Unit = null);
