import { api } from '../../shared/api/axios.api';
import { ApiResponse } from '../../shared/types/common.types';
import {
  ItemDto,
  CreateItemRequest,
  StockDto,
  StockAlertDto,
  GetItemsParams,
  GetStockParams,
  GetStockResponseData,
  StocktakeCreateRequest,
  StocktakeCountRequest,
  StocktakeCountsRequest,
  StocktakeResult,
  GetImportReceiptsParams,
  ImportReceiptDto,
  ImportReceiptRequest,
  ImportReceiptResult,
  ExportRequest,
  ExportResult,
  StockMutationRequest,
  StockMutationResult,
  PendingPrescriptionDto,
  DispensedPrescriptionDto,
  GetDispensedParams,
  DispenseResult,
  PrescriptionPrintDto,
  SupplierDto,
  SupplierRequest,
  FefoPreviewResult,
  PurchaseOrderPendingDto,
  PurchaseOrderForImportDto,
  CreateImportFromPoRequest,
  ImportFromPoResult,
  ProcedureSupplyExportDto,
  GetProcedureSupplyExportsParams,
  // Department Dispense
  TaoYeuCauXuatNoiBoRequest,
  InternalDispenseDto,
  GetInternalDispenseParams,
  DepartmentUsageStatDto,
  GetDepartmentUsageParams,
} from '../types/inventory.types';


export const inventoryApi = {
  // SUPPLIERS
  getSuppliers: (params?: { keyword?: string; status?: 1 | 2; pageIndex?: number; pageSize?: number }) =>
    api.get<ApiResponse<{ items: SupplierDto[]; total: number; pageIndex: number; pageSize: number }>>(
      '/inventory/suppliers',
      { params },
    ),
  createSupplier: (data: SupplierRequest) =>
    api.post<ApiResponse<{ id: number }>>('/inventory/suppliers', data),
  updateSupplier: (id: number, data: SupplierRequest) =>
    api.put<ApiResponse<{ id: number }>>(`/inventory/suppliers/${id}`, data),
  toggleSupplierStatus: (id: number) =>
    api.post<ApiResponse<{ id: number; trangThai: number }>>(`/inventory/suppliers/${id}/toggle-status`),

  // ─── DANH MỤC THUỐC / VẬT TƯ ─────────────────────────────────────────────

  /** Lấy danh sách mặt hàng có phân trang */
  getItems: (params?: GetItemsParams) =>
    api.get<ApiResponse<{ items: ItemDto[]; total: number }>>('/inventory/items', { params }),

  /** Tạo mới mặt hàng */
  createItem: (data: CreateItemRequest) =>
    api.post<ApiResponse<ItemDto>>('/inventory/items', data),

  /** Cập nhật mặt hàng */
  updateItem: (id: number, data: CreateItemRequest) =>
    api.put<ApiResponse<ItemDto>>(`/inventory/items/${id}`, data),

  /** Bật / Tắt trạng thái hoạt động */
  toggleItemStatus: (id: number) =>
    api.post<ApiResponse<ItemDto>>(`/inventory/items/${id}/toggle-status`),

  getImportReceipts: (params?: GetImportReceiptsParams) =>
    api.get<ApiResponse<{ items: ImportReceiptDto[]; total: number; pageIndex: number; pageSize: number }>>(
      '/inventory/import-receipts',
      { params },
    ),

  createImportReceipt: (data: ImportReceiptRequest) =>
    api.post<ApiResponse<ImportReceiptResult>>('/inventory/import-receipts', data),

  approveImport: (id: number) =>
    api.post<ApiResponse<ImportReceiptResult>>(`/inventory/import-receipts/${id}/approve`),

  updateImportReceipt: (id: number, data: ImportReceiptRequest) =>
    api.put<ApiResponse<ImportReceiptResult>>(`/inventory/import-receipts/${id}`, data),

  cancelImportReceipt: (id: number, reason?: string) =>
    api.post<ApiResponse<ImportReceiptResult>>(`/inventory/import-receipts/${id}/cancel`, { reason }),

  previewFefo: (prescriptionId: number) =>
    api.get<ApiResponse<FefoPreviewResult>>(`/inventory/prescriptions/${prescriptionId}/preview-fefo`),
  getProcedureSupplyExports: (params?: GetProcedureSupplyExportsParams) =>
    api.get<ApiResponse<{ items: ProcedureSupplyExportDto[]; total: number; pageIndex: number; pageSize: number }>>(
      '/inventory/exports/procedure-supplies',
      { params }
    ),
  exportInternalUse: (data: ExportRequest) =>
    api.post<ApiResponse<ExportResult>>('/inventory/exports/internal-use', data),
  returnToSupplier: (data: StockMutationRequest) =>
    api.post<ApiResponse<StockMutationResult>>('/inventory/returns', data),
  writeOff: (data: StockMutationRequest) =>
    api.post<ApiResponse<StockMutationResult>>('/inventory/write-offs', data),
  getPendingPrescriptions: (params?: { pageIndex?: number; pageSize?: number }) =>
    api.get<ApiResponse<{ items: PendingPrescriptionDto[]; total: number }>>(
      '/inventory/prescriptions/pending',
      { params },
    ),
  getDispensedPrescriptions: (params?: GetDispensedParams) =>
    api.get<ApiResponse<{ items: DispensedPrescriptionDto[]; total: number; pageIndex: number; pageSize: number }>>(
      '/inventory/prescriptions/dispensed',
      { params },
    ),
  dispensePrescription: (prescriptionId: number, idempotencyKey: string, note?: string) =>
    api.post<ApiResponse<DispenseResult>>(`/inventory/prescriptions/${prescriptionId}/dispense`, {
      idempotencyKey,
      note,
    }),
  getPrescriptionPrintData: (prescriptionId: number) =>
    api.get<ApiResponse<PrescriptionPrintDto>>(`/inventory/prescriptions/${prescriptionId}/print-data`),

  // ─── TỒN KHO ──────────────────────────────────────────────────────────────

  /** Lấy danh sách tồn kho (bao gồm thông tin lô và thống kê) */
  getStock: (params?: GetStockParams) =>
    api.get<ApiResponse<GetStockResponseData>>('/inventory/stock', { params }),

  /** Lấy thông tin cảnh báo tồn kho (KPI) */
  getStockAlerts: (params?: { expiringWithinDays?: number }) =>
    api.get<ApiResponse<StockAlertDto[]>>('/inventory/stock/alerts', { params }),

  createStocktake: (data: StocktakeCreateRequest) =>
    api.post<ApiResponse<StocktakeResult>>('/inventory/stocktakes', data),

  updateStocktakeCount: (stocktakeId: number, data: StocktakeCountRequest) =>
    api.put<ApiResponse<{ stocktakeId: number; stockId: number; actualQuantity: number }>>(
      `/inventory/stocktakes/${stocktakeId}/count`,
      data
    ),

  submitStocktake: (stocktakeId: number) =>
    api.post<ApiResponse<StocktakeResult>>(`/inventory/stocktakes/${stocktakeId}/submit`),

  approveStocktake: (stocktakeId: number, data: StocktakeCountsRequest) =>
    api.post<ApiResponse<StocktakeResult>>(`/inventory/stocktakes/${stocktakeId}/approve`, data),

  // ─── PURCHASE ORDERS (ĐƠN ĐẶT HÀNG) ──────────────────────────────────────
  getPendingPurchaseOrders: (supplierId?: number) =>
    api.get<ApiResponse<PurchaseOrderPendingDto[]>>('/purchase-orders/active-pending', {
      params: supplierId ? { supplierId } : undefined,
    }),

  getPurchaseOrderForImport: (id: number) =>
    api.get<ApiResponse<PurchaseOrderForImportDto>>(`/purchase-orders/${id}/for-import`),

  createImportFromPo: (data: CreateImportFromPoRequest) =>
    api.post<ApiResponse<ImportFromPoResult>>('/purchase-orders/import-receipt', data),

  // ── Xuất cấp phát nội bộ Khoa/Phòng ────────────────────────────────────────

  /** Khoa/Phòng tạo yêu cầu xin cấp phát vật tư tiêu hao */
  createInternalRequest: (data: TaoYeuCauXuatNoiBoRequest) =>
    api.post<ApiResponse<{ id: number; maPhieu: string; trangThai: string }>>('/inventory/dispense/internal-request', data),

  /** Admin duyệt phiếu — trừ kho FEFO */
  approveInternalDispense: (id: number) =>
    api.put<ApiResponse<{ id: number; maPhieu: string; trangThai: string }>>(`/inventory/dispense/${id}/approve`),

  /** Trưởng khoa xác nhận đã nhận hàng */
  confirmReceived: (id: number, nguoiNhanId?: number, ghiChuNhanHang?: string) =>
    api.put<ApiResponse<{ id: number; maPhieu: string; trangThai: string }>>(
      `/inventory/dispense/${id}/confirm-received`,
      { nguoiNhanId, ghiChuNhanHang },
      { params: { nguoiNhanId, ghiChuNhanHang } },
    ),

  /** Admin từ chối phiếu */
  rejectInternalDispense: (id: number, lyDo: string) =>
    api.put<ApiResponse<{ id: number; maPhieu: string; trangThai: string }>>(`/inventory/dispense/${id}/reject`, null, {
      params: { lyDo },
    }),

  /** Lấy danh sách phiếu xuất nội bộ Khoa/Phòng */
  getInternalDispenseList: (params?: GetInternalDispenseParams) =>
    api.get<ApiResponse<{ items: InternalDispenseDto[]; total: number; pageIndex: number; pageSize: number }>>(
      '/inventory/dispense/internal-list',
      { params },
    ),

  /** Thống kê tiêu hao theo Khoa/Phòng trong kỳ */
  getDepartmentUsageStats: (params: GetDepartmentUsageParams) =>
    api.get<ApiResponse<{ items: DepartmentUsageStatDto[]; tuNgay: string; denNgay: string }>>(
      '/inventory/dispense/department-usage-stats',
      { params },
    ),
};

