using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.DTOs.Kho.CapPhat;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;

namespace ClinicManagement.Application.Common.Interfaces;

public sealed record InventoryResult(object? Data, string? Message = null, int StatusCode = 200, string? RawJson = null)
{
    public bool IsSuccess => Message is null;
    public static InventoryResult Ok(object? data) => new(data);
    public static InventoryResult Error(string message, int statusCode = 400) => new(null, message, statusCode);
    public static InventoryResult Raw(string json, int statusCode) => new(null, null, statusCode, json);
}

public interface IKhoService
{
    void SetUserId(int userId);
    Task<InventoryResult> Items(string? keyword, LoaiItem? itemType, bool? isActive, int pageIndex = 1, int pageSize = 20);
    Task<InventoryResult> CreateItem(ItemRequest request);
    Task<InventoryResult> UpdateItem(int id, ItemRequest request);
    Task<InventoryResult> ToggleItem(int id);
    Task<InventoryResult> NhaCungCaps(string? keyword, TrangThaiNhaCungCap? status, int pageIndex = 1, int pageSize = 20);
    Task<InventoryResult> CreateNhaCungCap(NhaCungCapRequest request);
    Task<InventoryResult> UpdateNhaCungCap(int id, NhaCungCapRequest request);
    Task<InventoryResult> ToggleNhaCungCap(int id);
    Task<InventoryResult> Stock(string? keyword, bool lowStockOnly = false, int pageIndex = 1, int pageSize = 20, int? khoId = null, string? stockStatus = null);
    Task<InventoryResult> Alerts(int expiringWithinDays = 60);
    Task<InventoryResult> Import(ImportRequest request);
    Task<InventoryResult> GetPendingPurchaseOrders(int? supplierId);
    Task<InventoryResult> GetPurchaseOrderForImport(int id);
    Task<InventoryResult> CreateImportFromPo(CreateImportFromPoRequest request);
    Task<InventoryResult> ImportReceipts(
        string? keyword,
        TrangThaiPhieuNhap? status,
        DateTime? fromDate,
        DateTime? toDate,
        int pageIndex = 1,
        int pageSize = 20);
    Task<InventoryResult> ApproveImport(int id);
    Task<InventoryResult> UpdateImport(int id, ImportRequest request);
    Task<InventoryResult> CancelImport(int id, string? reason);
    Task<InventoryResult> PendingPrescriptions(int pageIndex = 1, int pageSize = 20);
    Task<InventoryResult> DispensedPrescriptions(string? keyword, DateTime? fromDate, DateTime? toDate, int pageIndex = 1, int pageSize = 20);
    Task<InventoryResult> Dispense(int prescriptionId, DispenseRequest request);
    Task<InventoryResult> PrescriptionPrintData(int prescriptionId);
    Task<InventoryResult> PreviewFefo(int prescriptionId);
    Task<InventoryResult> InternalUse(ExportRequest request);
    Task<InventoryResult> ReturnToSupplier(StockMutationRequest request);
    Task<InventoryResult> WriteOff(StockMutationRequest request);
    Task<InventoryResult> CreateStocktake(StocktakeCreateRequest request);
    Task<InventoryResult> CountStocktake(int id, StocktakeCountRequest request);
    Task<InventoryResult> SubmitStocktake(int id);
    Task<InventoryResult> ApproveStocktake(int id, StocktakeCountsRequest request);
    Task<InventoryResult> FinalizeStocktake(int id, StocktakeCountsRequest request);
    Task<InventoryResult> ReturnFromPatient(PatientReturnRequest request);
    Task<InventoryResult> Audit(int? itemId, DateTime? fromDate, DateTime? toDate, int pageIndex = 1, int pageSize = 50);
}

public interface IInventorySettings
{
    int DefaultWarehouseId { get; }
    bool RequirePaymentBeforeDispense { get; }
}
