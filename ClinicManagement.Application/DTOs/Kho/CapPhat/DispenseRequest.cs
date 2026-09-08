namespace ClinicManagement.Application.DTOs.Kho;

public sealed record DispenseRequest(string IdempotencyKey, string? Note, int? ExpectedVersion);
