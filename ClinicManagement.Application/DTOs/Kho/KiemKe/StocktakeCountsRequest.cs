namespace ClinicManagement.Application.DTOs.Kho;

public sealed record StocktakeCountsRequest(IEnumerable<StocktakeCountRequest> Counts, string IdempotencyKey);
