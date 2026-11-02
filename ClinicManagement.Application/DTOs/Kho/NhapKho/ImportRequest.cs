namespace ClinicManagement.Application.DTOs.Kho;

public sealed record ImportRequest(
    int SupplierId,
    DateTime ReceivedAt,
    string? Note,
    bool SaveDraft,
    string IdempotencyKey,
    IEnumerable<ImportItem> Items,
    int? WarehouseId = null);

public sealed record CancelImportRequest(string? Reason);
