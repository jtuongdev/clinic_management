// Item
export interface ConversionDto { unit: string; factor: number; }
export interface ItemDto {
  id: number; code: string; name: string;
  itemType: 'THUOC' | 'VA_TU'; baseUnit: string;
  dosageForm: string; strength: string;
  salePrice: number; minimumStock: number;
  isActive: boolean; canPrescribe: boolean;
  conversions: ConversionDto[];
}
export interface CreateItemRequest {
  code: string; name: string; itemType: 'THUOC' | 'VA_TU';
  baseUnit: string; dosageForm?: string; strength?: string;
  salePrice: number; minimumStock: number; canPrescribe: boolean;
  conversions?: ConversionDto[];
}
export interface GetItemsParams {
  keyword?: string;
  itemType?: 'THUOC' | 'VA_TU';
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

// Stock
export interface BatchDto {
  stockId: number; batchNumber: string;
  expiryDate: string | null; quantity: number; daysToExpiry: number | null;
}
export interface StockDto {
  itemId: number; itemCode: string; itemName: string;
  itemType?: 'THUOC' | 'VA_TU';
  baseUnit: string; totalStock: number; minimumStock: number;
  isLowStock: boolean; isOutOfStock?: boolean; batches: BatchDto[];
}
export interface StockAlertDto {
  stockId: number; itemId: number; itemCode: string;
  itemName: string; batchNumber: string;
  expiryDate: string; quantity: number;
}
export interface GetStockParams {
  keyword?: string;
  lowStockOnly?: boolean;
  stockStatus?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  warehouseId?: number;
  pageIndex?: number;
  pageSize?: number;
}
export interface GetStockResponseData {
  items: StockDto[];
  total: number;
  totalCatalog?: number;
  inStockCount?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  pageIndex: number;
  pageSize: number;
}

// Import
export interface ImportLineRequest {
  itemId: number; quantity: number; purchasePrice: number;
  batchNumber: string; expiryDate?: string; unit?: string;
}
export interface ImportReceiptRequest {
  supplierId: number; receivedAt: string; note?: string;
  saveDraft: boolean; idempotencyKey: string; items: ImportLineRequest[];
  warehouseId?: number;
}
export interface CancelImportRequest {
  reason?: string;
}
export interface ImportReceiptResult {
  id: number; referenceCode: string; status: string;
}
export type ImportReceiptStatus = 'TAM' | 'CHO_DUYET' | 'DA_NHAP' | 'DA_HUY';
export interface ImportReceiptLineDto {
 id: number; itemId: number; itemCode: string; itemName: string;
 itemType: 'THUOC' | 'VA_TU'; baseUnit: string;
 quantity: number; purchasePrice: number; lineAmount: number;
 batchNumber: string; expiryDate: string | null; location: string;
 stockId: number | null; stockQuantity: number | null;
}
export interface ImportReceiptDto {
 id: number; referenceCode: string; receivedAt: string;
 totalAmount: number; status: ImportReceiptStatus; note: string;
 facility: { id: number; code: string; name: string };
 warehouse: { id: number; name: string; address: string };
 supplier: {
   id: number; code: string; name: string; address: string;
   phone: string; taxCode: string;
 };
 receivedBy: { id: number; name: string };
 lines: ImportReceiptLineDto[];
}
export interface GetImportReceiptsParams {
 keyword?: string; status?: ImportReceiptStatus;
 fromDate?: string; toDate?: string; pageIndex?: number; pageSize?: number;
}

// Prescription / Dispense
export interface PendingPrescriptionDto {
  id?: number;
  prescriptionId: number;
  prescriptionCode?: string;
  maLuotKham: number;
  visitId?: number;
  maBacSi: number;
  doctorName?: string;
  patientName?: string;
  patientCode?: string;
  ngayKe: string;
  prescribedAt?: string;
  trangThai: string;
  status?: string;
  isPaid?: boolean;
  canDispense?: boolean;
  invoiceNumber?: string;
  invoiceStatus?: string;
  invoiceAmount?: number;
  lineCount?: number;
  ghiChu?: string;
}

export interface FefoBatchAllocation {
  stockId: number;
  batchNumber: string;
  expiryDate?: string;
  quantityToTake: number;
  availableBefore: number;
  availableAfter: number;
}

export interface FefoItemPreview {
  itemId: number;
  itemCode: string;
  itemName: string;
  baseUnit: string;
  prescribedQuantity: number;
  dispensedQuantity: number;
  remainingQuantity: number;
  totalAvailableStock: number;
  isSufficient: boolean;
  allocations: FefoBatchAllocation[];
}

export interface FefoPreviewResult {
  prescriptionId: number;
  prescriptionCode: string;
  patientName: string;
  patientCode?: string;
  doctorName: string;
  isPaid: boolean;
  canDispense: boolean;
  invoiceNumber?: string;
  requirePayment?: boolean;
  allAvailable: boolean;
  items: FefoItemPreview[];
}

export interface DispenseRequest {
  idempotencyKey: string;
  note?: string;
  expectedVersion?: number;
}

export interface AllocationDto {
  batchNumber: string;
  quantity: number;
}

export interface DispensedItemDto {
  itemId: number;
  itemName: string;
  quantity: number;
  allocations: AllocationDto[];
}

export interface PrescriptionPrintFacilityDto {
  ten: string;
  diaChi: string;
  hotline: string;
}

export interface PrescriptionPrintHeaderDto {
  soYTe: string;
  coSo: PrescriptionPrintFacilityDto;
  maDonThuoc: string;
  maLuotKham: string;
  maBenhNhan: string;
  tieuDe: string;
  phuDe: string;
}

export interface PrescriptionPrintPatientDto {
  hoTen: string;
  tuoi: number;
  gioiTinh: string;
  soCccdBhyt: string;
  dienThoai: string;
  diaChi: string;
}

export interface PrescriptionPrintDiagnosisDto {
  maICD?: string;
  maIcd?: string;
  tenChanDoan: string;
}

export interface PrescriptionPrintBatchDto {
  soLo: string;
  hanSuDung?: string | null;
  soLuong: number;
}

export interface PrescriptionPrintItemDto {
  stt: number;
  maThuoc: string;
  tenThuoc: string;
  dangBaoChe: string;
  soLuong: number;
  soLuongChu?: string;
  donViTinh: string;
  loHang: PrescriptionPrintBatchDto[];
  cachDung: string;
}

export interface PrescriptionPrintDoctorDto {
  hoTen: string;
  maCCHN?: string;
  maCchn?: string;
}

export interface PrescriptionPrintDispenserDto {
  hoTen: string;
  trangThaiCapPhat: string;
}

export interface PrescriptionPrintConfirmationDto {
  ngayKe: string;
  bacSiKeDon: PrescriptionPrintDoctorDto;
  duocSiPhatThuoc: PrescriptionPrintDispenserDto;
}

export interface PrescriptionPrintDto {
  header: PrescriptionPrintHeaderDto;
  benhNhan: PrescriptionPrintPatientDto;
  chanDoan: PrescriptionPrintDiagnosisDto;
  danhSachThuoc: PrescriptionPrintItemDto[];
  loiDan: string[];
  xacNhan: PrescriptionPrintConfirmationDto;
  ghiChuChanTrang: string[];
}

export interface DispenseResult {
  prescriptionId: number;
  exportReceiptId: number;
  prescriptionStatus: string;
  dispensedItems: DispensedItemDto[];
  printData?: PrescriptionPrintDto;
}

export interface DispensedPrescriptionDto {
  prescriptionId: number;
  prescriptionCode: string;
  maLuotKham: number;
  patientName: string;
  doctorName: string;
  dispenserName: string;
  ngayKe: string;
  ngayCapThuoc: string | null;
  exportReceiptCode: string | null;
  soLuongDong: number;
  trangThai: string;
}

export interface GetDispensedParams {
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
}

// Export Retail / Internal Use
export interface ExportLineRequest {
  itemId: number; quantity: number; unit?: string; unitPrice?: number;
}
export interface ExportRequest {
  idempotencyKey: string; visitId: number;
  note?: string; paymentMethod?: string; paidAmount: number;
  items: ExportLineRequest[];
}
export interface ExportResult { exportReceiptId: number; referenceCode: string; }

// Stock Mutation (returns, write-offs)
export interface StockMutationRequest {
  stockId: number; quantity: number;
  reason: string; idempotencyKey: string;
}
export interface StockMutationResult {
  stockId: number; referenceCode: string; quantity: number;
}

// Stocktake
export interface StocktakeCountItem {
  stockId: number; actualQuantity: number; reason?: string;
}
export interface StocktakeResult {
  id: number; referenceCode: string; status: string;
}
export interface StocktakeCreateRequest {
  note?: string;
  idempotencyKey: string;
}
export interface StocktakeCountRequest {
  stockId: number;
  actualQuantity: number;
  reason?: string;
}
export interface StocktakeCountsRequest {
  counts: StocktakeCountRequest[];
  idempotencyKey: string;
}

// Audit
export interface AuditTransactionDto {
  id: number; createdAt: string; transactionType: string;
  referenceCode: string; itemId: number; batchNumber: string;
  quantityBefore: number; quantityChange: number;
  quantityAfter: number; performer: number | null;
}

// Supplier
export interface SupplierDto {
  id: number;
  ma: string;
  ten: string;
  diaChi: string;
  dienThoai: string;
  email: string;
  maSoThue: string;
  trangThai: 1 | 2 | 'HoatDong' | 'NgungHopTac'; // API có thể trả enum dạng số hoặc chuỗi
}
export interface SupplierRequest {
  ma: string;
  ten: string;
  diaChi?: string;
  dienThoai?: string;
  email?: string;
  maSoThue?: string;
}

// Purchase Order (Đơn đặt hàng)
export type PurchaseOrderStatus = 'CHO_DUYET' | 'DA_DAT' | 'GIAO_MOT_PHAN' | 'HOAN_THANH' | 'DA_HUY';

export interface PurchaseOrderPendingDto {
  id: number;
  poCode: string;
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  totalAmount: number;
  status: PurchaseOrderStatus;
  itemCount: number;
  note?: string;
}

export interface PurchaseOrderForImportLineDto {
  poDetailId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  itemType: 'THUOC' | 'VA_TU';
  unit: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRemaining: number;
  unitPrice: number;
  defaultBatchNumber: string;
}

export interface PurchaseOrderForImportDto {
  id: number;
  poCode: string;
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  totalAmount: number;
  status: PurchaseOrderStatus;
  note?: string;
  lines: PurchaseOrderForImportLineDto[];
}

export interface ImportFromPoLineItem {
  poDetailId: number;
  itemId: number;
  quantity: number;
  purchasePrice: number;
  batchNumber: string;
  expiryDate?: string | null;
  unit?: string;
}

export interface CreateImportFromPoRequest {
  purchaseOrderId: number;
  supplierId: number;
  warehouseId?: number;
  receivedAt: string;
  referenceCode?: string;
  note?: string;
  saveDraft: boolean;
  idempotencyKey: string;
  lines: ImportFromPoLineItem[];
}

export interface ImportFromPoResult {
  id: number;
  referenceCode: string;
  status: string;
  purchaseOrderId: number;
  purchaseOrderStatus: string;
}

