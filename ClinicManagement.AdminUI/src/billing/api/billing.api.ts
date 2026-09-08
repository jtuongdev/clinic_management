import { api } from '../../shared/api/axios.api';
import { ApiResponse, PagedResult } from '../../shared/types/common.types';
import {
  HoaDonListItemDto,
  HoaDonDetailDto,
  PhieuThuDto,
  CongNoDto,
  RecordPaymentRequest,
  ApplyInsuranceRequest,
  CancelInvoiceRequest,
  GetInvoicesParams,
} from '../types/billing.types';

export const billingApi = {
  /** Lấy danh sách hóa đơn theo cơ sở, trạng thái, ngày lập (phân trang) */
  getInvoices: (params?: GetInvoicesParams) =>
    api.get<ApiResponse<PagedResult<HoaDonListItemDto>>>('/billing/invoices', {
      params: {
        facilityId: params?.facilityId ?? 1,
        ...params,
      },
    }),

  /** Chi tiết hóa đơn kèm các dòng chi phí, phiếu thu, công nợ */
  getInvoiceById: (id: number) =>
    api.get<ApiResponse<HoaDonDetailDto>>(`/billing/invoices/${id}`),

  /** Lấy hóa đơn theo mã lượt khám */
  getInvoiceByVisit: (visitId: number) =>
    api.get<ApiResponse<HoaDonDetailDto>>(`/billing/invoices/by-visit/${visitId}`),

  /** Lịch sử phiếu thu của một hóa đơn */
  getInvoicePayments: (id: number) =>
    api.get<ApiResponse<PhieuThuDto[]>>(`/billing/invoices/${id}/payments`),

  /** Ghi nhận thanh toán cho hóa đơn (tạo phiếu thu) */
  recordPayment: (id: number, data: RecordPaymentRequest) =>
    api.post<ApiResponse<HoaDonDetailDto>>(`/billing/invoices/${id}/payments`, data),

  /** Áp dụng / cập nhật số tiền BHYT chi trả */
  applyInsurance: (id: number, data: ApplyInsuranceRequest) =>
    api.post<ApiResponse<HoaDonDetailDto>>(`/billing/invoices/${id}/insurance`, data),

  /** Hủy hóa đơn (kèm lý do, chỉ hủy khi chưa thu tiền) */
  cancelInvoice: (id: number, data: CancelInvoiceRequest) =>
    api.post<ApiResponse<HoaDonDetailDto>>(`/billing/invoices/${id}/cancel`, data),

  /** Tra cứu công nợ theo bệnh nhân */
  getPatientDebts: (patientId: number) =>
    api.get<ApiResponse<CongNoDto[]>>(`/billing/debts/by-patient/${patientId}`),

  /** Danh sách công nợ quá hạn */
  getOverdueDebts: (facilityId: number = 1) =>
    api.get<ApiResponse<CongNoDto[]>>('/billing/debts/overdue', {
      params: { facilityId },
    }),
};
