import { api } from '../../shared/api/axios.api';

export interface RolePermissionMatrixDto {
  id: number;
  code: string;
  name: string;
  description: string;
  dataScope: string;
  permissions: Record<string, string[]>;
}

export interface EmrAuditLogDto {
  id: number;
  patientId?: number;
  recordId?: number;
  userId?: number;
  userName: string;
  userRole: string;
  patientCode?: string;
  patientName?: string;
  action: string;
  actionName?: string;
  module: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  status: string;
}

export interface IntegrationSettingDto {
  category: string;
  code: string;
  name: string;
  value: string;
  description?: string;
  isEncrypted?: boolean;
}

export const settingsApi = {
  // Roles & RBAC Matrix
  getRoles: () => {
    return api.get<{ success: boolean; data: RolePermissionMatrixDto[] }>('/admin/roles');
  },
  updateRole: (payload: RolePermissionMatrixDto) => {
    return api.post<{ success: boolean; data: RolePermissionMatrixDto }>('/admin/roles', payload);
  },

  // EMR Audit Logs
  getAuditLogs: (params?: {
    patientId?: number;
    userId?: number;
    action?: string;
    module?: string;
    from?: string;
    to?: string;
    pageIndex?: number;
    pageSize?: number;
  }) => {
    return api.get<{ success: boolean; data: EmrAuditLogDto[]; total?: number }>('/admin/audit-logs', { params });
  },
  exportAuditLogsCsv: (params?: any) => {
    return api.get('/admin/audit-logs/export', { params, responseType: 'blob' });
  },

  // Integration Settings
  getIntegrationConfig: (category?: string) => {
    return api.get<{ success: boolean; data: IntegrationSettingDto[] }>('/admin/integration-config', { params: { category } });
  },
  upsertIntegrationSetting: (payload: IntegrationSettingDto) => {
    return api.post<{ success: boolean; data: IntegrationSettingDto }>('/admin/integration-config', payload);
  },
};
