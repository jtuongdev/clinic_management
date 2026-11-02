import { api } from '../../shared/api/axios.api';
import {
  SystemReportsOverviewDto,
  SystemReportsClinicalDto,
  SystemReportsFinanceDto,
  SystemReportsInventoryDto,
  SystemReportsProductivityDto,
} from '../types/systemReports.types';

export interface ReportQueryParams {
  facilityId?: number;
  departmentId?: number;
  fromDate?: string;
  toDate?: string;
  shift?: string;
}

export const systemReportsApi = {
  // GET /api/system-reports/overview
  getOverview: (params?: ReportQueryParams) => {
    return api.get<{ success: boolean; data: SystemReportsOverviewDto }>('/system-reports/overview', { params });
  },

  // GET /api/system-reports/clinical
  getClinical: (params?: ReportQueryParams) => {
    return api.get<{ success: boolean; data: SystemReportsClinicalDto }>('/system-reports/clinical', { params });
  },

  // GET /api/system-reports/finance
  getFinance: (params?: ReportQueryParams & { groupBy?: string }) => {
    return api.get<{ success: boolean; data: SystemReportsFinanceDto }>('/system-reports/finance', { params });
  },

  // GET /api/system-reports/inventory
  getInventory: (params?: { facilityId?: number }) => {
    return api.get<{ success: boolean; data: SystemReportsInventoryDto }>('/system-reports/inventory', { params });
  },

  // GET /api/system-reports/productivity
  getProductivity: (params?: ReportQueryParams) => {
    return api.get<{ success: boolean; data: SystemReportsProductivityDto }>('/system-reports/productivity', { params });
  },

  // GET /api/system-reports/export
  exportReport: async (tab: string, params?: ReportQueryParams) => {
    const res = await api.get('/system-reports/export', {
      params: { tab, ...params },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_${tab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
