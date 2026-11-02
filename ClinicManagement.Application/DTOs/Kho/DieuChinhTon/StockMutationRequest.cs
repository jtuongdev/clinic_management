namespace ClinicManagement.Application.DTOs.Kho;

public sealed record StockMutationRequest(int StockId, decimal Quantity, string Reason, string IdempotencyKey);
