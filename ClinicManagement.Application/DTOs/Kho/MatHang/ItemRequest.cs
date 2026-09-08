using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.Kho;

public sealed record ItemRequest(string Code, string Name, LoaiItem ItemType, string BaseUnit, string? DosageForm,
    string? Strength, decimal SalePrice, decimal MinimumStock, bool CanPrescribe = true,
    IEnumerable<ConversionRequest>? Conversions = null);
