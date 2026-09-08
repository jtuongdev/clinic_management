namespace ClinicManagement.Application.DTOs.Kho;

public sealed record ExportRequest(string IdempotencyKey, int VisitId, string? Note, string? PaymentMethod, decimal PaidAmount, IEnumerable<ExportItem> Items);
