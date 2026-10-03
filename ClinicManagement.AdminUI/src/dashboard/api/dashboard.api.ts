import { api } from '../../shared/api/axios.api';

export interface DashboardOverviewDto {
  date: string;
  totalPatients: number;
  visitsToday: number;
  pendingVisits: number;
  revenueMonth: number;
  overdueDebt: number;
  invoicesToday: number;
  overdueDebts: Array<{
    debtor: string;
    badge: string;
    badgeColor: 'danger' | 'warning' | 'default' | 'success';
    amount: string;
    amountColor: 'overdue' | 'pending' | 'paid';
  }>;
  activities: Array<{
    dotColor: 'blue' | 'green' | 'orange' | 'red';
    text: string;
    highlight?: string;
    time: string;
  }>;
}

export interface ExaminationFinanceDto {
  kpis: {
    revenue: number;
    unpaid: number;
    paid: number;
    insurance: number;
    overdue: number;
    invoiceCount: number;
  };
  invoices: Array<{
    code: string;
    patient: string;
    total: number | string;
    remaining: number | string;
    status: 'unpaid' | 'partial' | 'paid';
  }>;
}

export interface ExaminationHRDto {
  kpis: {
    total: number;
    doctors: number;
    onDuty: number;
    leave: number;
  };
  staff: Array<{
    id: number;
    name: string;
    dept: string;
    room?: string;
    shift?: string;
    status: 'active' | 'doing' | 'alert' | 'idle' | string;
  }>;
}

export interface ExaminationReportsDto {
  kpis: {
    revenue: number;
    completedVisits: number;
    activeDoctors: number;
    openDepartments: number;
    bhytReimbursementRate: number | null;
    patientSatisfactionRate?: number | null;
    satisfactionRate?: number | null;
  };
  revenueByDepartment: Array<{
    name: string;
    value: number;
    percentage?: number;
  }>;
  doctorKpis: Array<{
    rank: number;
    doctorId?: number;
    name: string;
    department: string;
    count: number;
    rating?: string;
    revenue?: number;
  }>;
}

export const dashboardApi = {
  // GET /api/admin/dashboard/overview
  getOverview: (params?: { facilityId?: number; date?: string }) => {
    return api.get<{ success: boolean; data: DashboardOverviewDto }>('/admin/dashboard/overview', { params });
  },

  // GET /api/admin/dashboard/finance
  getFinance: (params?: { fromDate?: string; toDate?: string; facilityId?: number }) => {
    return api.get<{ success: boolean; data: ExaminationFinanceDto }>('/admin/dashboard/finance', { params });
  },

  // GET /api/admin/dashboard/staff
  getStaff: (params?: { facilityId?: number }) => {
    return api.get<{ success: boolean; data: ExaminationHRDto }>('/admin/dashboard/staff', { params });
  },

  // GET /api/admin/dashboard/reports
  getReports: (params?: { fromDate?: string; toDate?: string; facilityId?: number; departmentId?: number; shift?: string }) => {
    return api.get<{ success: boolean; data: ExaminationReportsDto }>('/admin/dashboard/reports', { params });
  },

  // GET /api/admin/dashboard/reports/export
  exportReportsCsv: (params?: { fromDate?: string; toDate?: string; facilityId?: number; departmentId?: number; shift?: string }) => {
    return api.get('/admin/dashboard/reports/export', { params, responseType: 'blob' });
  },
};
