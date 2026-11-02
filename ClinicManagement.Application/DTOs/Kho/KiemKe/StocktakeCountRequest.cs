namespace ClinicManagement.Application.DTOs.Kho;

public sealed record StocktakeCountRequest(int StockId, decimal ActualQuantity, string? Reason);
