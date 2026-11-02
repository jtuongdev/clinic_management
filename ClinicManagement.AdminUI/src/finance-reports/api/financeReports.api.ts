import { api } from '../../shared/api/axios.api';
import { ApiResponse } from '../../shared/types/common.types';
import {
  BaoCaoDoanhThuResponseDto,
  BaoCaoCongNoResponseDto,
  BaoCaoThuChiResponseDto,
  GetFinanceReportParams,
} from '../types/financeReports.types';

export const financeReportsApi = {
  /** Lấy báo cáo doanh thu */
  getRevenueReport: (params?: GetFinanceReportParams) =>
    api.get<ApiResponse<BaoCaoDoanhThuResponseDto>>('/finance-reports/revenue', {
      params,
    }),

  /** Lấy báo cáo công nợ tổng hợp (AR & AP) */
  getDebtSummaryReport: (params?: { facilityId?: number; asOfDate?: string }) =>
    api.get<ApiResponse<BaoCaoCongNoResponseDto>>('/finance-reports/debts', {
      params,
    }),

  /** Lấy báo cáo dòng tiền thu - chi & lợi nhuận */
  getCashflowReport: (params?: { facilityId?: number; fromDate?: string; toDate?: string }) =>
    api.get<ApiResponse<BaoCaoThuChiResponseDto>>('/finance-reports/cashflow', {
      params,
    }),

  /** Xuất file báo cáo tài chính (CSV/Excel) */
  exportReport: async (
    reportType: 'revenue' | 'debts' | 'cashflow',
    params?: GetFinanceReportParams
  ) => {
    const res = await api.get('/finance-reports/export', {
      params: {
        reportType,
        ...params,
      },
      responseType: 'blob',
    });

    // Tải file về máy người dùng
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
