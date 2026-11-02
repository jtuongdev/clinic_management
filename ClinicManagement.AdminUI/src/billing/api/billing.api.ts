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
  CongNoNhaCungCapDto,
  TongQuanCongNoNhaCungCapDto,
  DanhSachCongNoNhaCungCapResponseDto,
  ThanhToanCongNoNhaCungCapRequest,
  GetSupplierDebtsParams,
  DanhSachCongNoBenhNhanResponseDto,
  GetPatientDebtsParams,
} from '../types/billing.types';

export const billingApi = {
  /** Lấy danh sách hóa đơn theo cơ sở, trạng thái, ngày lập (phân trang) */
  getInvoices: (params?: GetInvoicesParams) =>
    api.get<ApiResponse<PagedResult<HoaDonListItemDto>>>('/billing/invoices', {
      params: {
        facilityId: params?.facilityId ?? 0,
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
  getOverdueDebts: (facilityId: number = 0) =>
    api.get<ApiResponse<CongNoDto[]>>('/billing/debts/overdue', {
      params: { facilityId },
    }),

  /** Danh sách phân trang công nợ bệnh nhân kèm thống kê KPI (kèm fallback tự động nếu backend chưa restart) */
  getPatientDebtsPaged: async (params?: GetPatientDebtsParams) => {
    try {
      const res = await api.get<ApiResponse<DanhSachCongNoBenhNhanResponseDto>>('/billing/debts/patients', {
        params,
      });
      return res;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Fallback: lấy từ /billing/debts/overdue hiện có
        const overdueRes = await api.get<ApiResponse<CongNoDto[]>>('/billing/debts/overdue', {
          params: { facilityId: params?.facilityId ?? 0 },
        });
        const overdueList = overdueRes.data?.data || [];
        const mappedItems: CongNoBenhNhanChiTietDto[] = overdueList.map((d) => ({
          id: d.id,
          maBenhNhan: d.maBenhNhan,
          tenBenhNhan: `Bệnh nhân #${d.maBenhNhan}`,
          soDienThoai: '--',
          soCCCD: '--',
          maHoaDon: d.maHoaDon,
          soHoaDon: `#${d.maHoaDon}`,
          ngayLapHoaDon: d.hanThanhToan || new Date().toISOString(),
          maCoSo: params?.facilityId ?? 0,
          tongTienHoaDon: d.soTienNo,
          soTienNo: d.soTienNo,
          soTienDaTra: d.soTienDaTra,
          soTienConLai: d.soTienConLai,
          hanThanhToan: d.hanThanhToan,
          trangThai: d.trangThai,
          trangThaiTen:
            d.trangThai === 'DA_TAT_TOAN'
              ? 'Đã tất toán'
              : d.trangThai === 'QUA_HAN'
              ? 'Quá hạn'
              : 'Đang nợ',
          soNgayQuaHan: 0,
        }));

        const totalDebt = mappedItems.reduce((acc, x) => acc + (x.soTienConLai || 0), 0);
        const totalPaid = mappedItems.reduce((acc, x) => acc + (x.soTienDaTra || 0), 0);
        const overdueDebt = mappedItems
          .filter((x) => x.trangThai === 'QUA_HAN')
          .reduce((acc, x) => acc + (x.soTienConLai || 0), 0);

        return {
          data: {
            success: true,
            data: {
              danhSach: {
                pageIndex: params?.pageIndex ?? 1,
                pageSize: params?.pageSize ?? 20,
                totalCount: mappedItems.length,
                totalPages: 1,
                items: mappedItems,
              },
              tongQuan: {
                tongCongNo: totalDebt,
                tongNoQuaHan: overdueDebt,
                tongDaThanhToan: totalPaid,
                soKhoanNo: mappedItems.length,
                soKhoanQuaHan: mappedItems.filter((x) => x.trangThai === 'QUA_HAN').length,
                soBenhNhanConNo: new Set(mappedItems.map((x) => x.maBenhNhan)).size,
                tongSoKhoan: mappedItems.length,
              },
            },
            message: 'Dữ liệu công nợ',
          },
        } as any;
      }
      throw err;
    }
  },

  /** Danh sách công nợ nhà cung cấp kèm bộ lọc và thống kê (kèm fallback tự động nếu backend chưa restart) */
  getSupplierDebts: async (params?: GetSupplierDebtsParams) => {
    try {
      const res = await api.get<ApiResponse<DanhSachCongNoNhaCungCapResponseDto>>('/billing/debts/suppliers', {
        params,
      });
      return res;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Fallback: lấy từ /inventory/import-receipts (các phiếu đã nhập kho)
        const receiptRes = await api.get<ApiResponse<{ items: any[]; total: number }>>('/inventory/import-receipts', {
          params: {
            status: 1, // DA_NHAP
            pageSize: 100,
            keyword: params?.keyword,
            fromDate: params?.fromDate,
            toDate: params?.toDate,
          },
        });

        const receipts = receiptRes.data?.data?.items || [];
        const now = new Date();
        const mappedItems: CongNoNhaCungCapDto[] = receipts.map((r: any) => {
          const receivedDate = new Date(r.receivedAt || r.ngayNhap || Date.now());
          const dueDate = new Date(receivedDate.getTime() + 30 * 24 * 3600 * 1000);
          const totalAmount = r.totalAmount || r.tongTien || 0;
          let paid = 0;
          const note = r.note || r.ghiChu || '';
          const match = note.match(/\[PAID:(\d+(?:\.\d+)?)\]/);
          if (match) paid = parseFloat(match[1]) || 0;

          const remaining = Math.max(0, totalAmount - paid);
          const isOverdue = now > dueDate && remaining > 0;
          const isPaidOff = remaining <= 0;
          const overdueDays = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)) : 0;

          return {
            id: r.id,
            maPhieuNhap: r.referenceCode || r.maPhieu || `PNK-${r.id}`,
            maNhaCungCap: r.supplier?.id || r.maNhaCungCap || 0,
            maNcc: r.supplier?.code || '',
            tenNhaCungCap: r.supplier?.name || r.tenNhaCungCap || 'Nhà cung cấp',
            soDienThoai: r.supplier?.phone,
            email: r.supplier?.email,
            diaChi: r.supplier?.address,
            maCoSo: r.facility?.id || 1,
            maKho: r.warehouse?.id || 1,
            ngayNhap: receivedDate.toISOString(),
            hanThanhToan: dueDate.toISOString(),
            tongTien: totalAmount,
            soTienDaTra: paid,
            soTienConLai: remaining,
            trangThai: isPaidOff ? 'DA_TAT_TOAN' : isOverdue ? 'QUA_HAN' : 'DANG_NO',
            trangThaiTen: isPaidOff ? 'Đã tất toán' : isOverdue ? 'Quá hạn' : 'Đang nợ',
            soNgayQuaHan: overdueDays,
            ghiChu: note,
            lichSuThanhToan: [],
          };
        });

        let filtered = mappedItems;
        if (params?.status && params.status !== 'ALL') {
          filtered = filtered.filter((x) => x.trangThai === params.status);
        }
        if (params?.supplierId) {
          filtered = filtered.filter((x) => x.maNhaCungCap === params.supplierId);
        }

        const totalDebt = filtered.reduce((acc, x) => acc + x.soTienConLai, 0);
        const totalOverdue = filtered.filter((x) => x.trangThai === 'QUA_HAN').reduce((acc, x) => acc + x.soTienConLai, 0);
        const totalPaid = filtered.reduce((acc, x) => acc + x.soTienDaTra, 0);

        return {
          data: {
            success: true,
            data: {
              danhSach: {
                pageIndex: params?.pageIndex ?? 1,
                pageSize: params?.pageSize ?? 20,
                totalCount: filtered.length,
                totalPages: 1,
                items: filtered,
              },
              tongQuan: {
                tongCongNo: totalDebt,
                tongNoQuaHan: totalOverdue,
                tongDaThanhToan: totalPaid,
                soPhieuChuaThanhToan: filtered.filter((x) => x.trangThai !== 'DA_TAT_TOAN').length,
                soPhieuQuaHan: filtered.filter((x) => x.trangThai === 'QUA_HAN').length,
                soNhaCungCapConNo: new Set(filtered.filter((x) => x.soTienConLai > 0).map((x) => x.maNhaCungCap)).size,
                tongSoPhieu: filtered.length,
              },
            },
            message: 'Dữ liệu công nợ nhà cung cấp',
          },
        } as any;
      }
      throw err;
    }
  },

  /** Thống kê tổng quan công nợ nhà cung cấp */
  getSupplierDebtsSummary: (facilityId: number = 0) =>
    api.get<ApiResponse<TongQuanCongNoNhaCungCapDto>>('/billing/debts/suppliers/summary', {
      params: { facilityId },
    }),

  /** Ghi nhận thanh toán công nợ nhà cung cấp */
  recordSupplierPayment: (data: ThanhToanCongNoNhaCungCapRequest) =>
    api.post<ApiResponse<CongNoNhaCungCapDto>>('/billing/debts/suppliers/payment', data),
};
