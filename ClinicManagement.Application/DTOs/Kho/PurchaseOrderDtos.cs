using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.Kho;

public sealed record PurchaseOrderPendingDto(
    int Id,
    string PoCode,
    int SupplierId,
    string SupplierCode,
    string SupplierName,
    int WarehouseId,
    string WarehouseName,
    DateTime OrderDate,
    DateTime? ExpectedDeliveryDate,
    decimal TotalAmount,
    string Status,
    int ItemCount,
    string? Note
);

public sealed record PurchaseOrderForImportLineDto(
    int PoDetailId,
    int ItemId,
    string ItemCode,
    string ItemName,
    string ItemType,
    string Unit,
    decimal QuantityOrdered,
    decimal QuantityReceived,
    decimal QuantityRemaining,
    decimal UnitPrice,
    string DefaultBatchNumber
);

public sealed record PurchaseOrderForImportDto(
    int Id,
    string PoCode,
    int SupplierId,
    string SupplierCode,
    string SupplierName,
    int WarehouseId,
    string WarehouseName,
    DateTime OrderDate,
    DateTime? ExpectedDeliveryDate,
    decimal TotalAmount,
    string Status,
    string? Note,
    IReadOnlyList<PurchaseOrderForImportLineDto> Lines
);

public sealed record ImportFromPoLineItem(
    int PoDetailId,
    int ItemId,
    decimal Quantity,
    decimal PurchasePrice,
    string BatchNumber,
    DateTime? ExpiryDate,
    string? Unit = null
);

public sealed record CreateImportFromPoRequest(
    int PurchaseOrderId,
    int SupplierId,
    DateTime ReceivedAt,
    string? ReferenceCode,
    string? Note,
    bool SaveDraft,
    string IdempotencyKey,
    IEnumerable<ImportFromPoLineItem> Lines,
    int? WarehouseId = null
);
