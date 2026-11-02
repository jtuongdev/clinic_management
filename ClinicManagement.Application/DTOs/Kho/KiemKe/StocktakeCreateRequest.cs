namespace ClinicManagement.Application.DTOs.Kho;

public sealed record StocktakeCreateRequest(string? Note, string IdempotencyKey);
