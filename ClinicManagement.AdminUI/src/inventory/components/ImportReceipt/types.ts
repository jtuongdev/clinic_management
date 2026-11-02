import type { Dayjs } from 'dayjs';
import type { ImportReceiptDto } from '../../types/inventory.types';

// Props của form chính
export interface ImportReceiptFormProps {
  open: boolean;
  loading: boolean;
  initialData?: ImportReceiptDto | null;
  onSubmit: (data: import('../../types/inventory.types').ImportReceiptRequest, id?: number) => void;
  onCancel: () => void;
}

// Dữ liệu một dòng chi tiết trong phiếu nhập
export interface ImportFormLineItem {
  itemId: number;
  unit?: string;
  lotNumber: string;
  expiryDate: Dayjs;
  quantity: number;
  purchasePrice: number;
}

// Giá trị toàn bộ form
export interface ImportFormValues {
  supplierId: number;
  warehouseId?: number;
  referenceCode?: string;
  importDate: Dayjs;
  note?: string;
  saveDraft: boolean;
  lines: ImportFormLineItem[];
}
