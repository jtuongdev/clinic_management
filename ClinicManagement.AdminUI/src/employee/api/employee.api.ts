import { api } from '../../shared/api/axios.api';
import type { ApiResponse, PagedResult } from '../../shared/types/common.types';
import type { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../types/employee.types';

export const employeeApi = {
  getPaged: (params: { pageIndex: number; pageSize: number; keyword?: string; isActive?: boolean }) =>
    api.get<ApiResponse<PagedResult<Employee>>>('/NhanVien', { params }),
  getById: (id: number) => api.get<ApiResponse<Employee>>(`/NhanVien/${id}`),
  create: (data: CreateEmployeeRequest) => api.post<ApiResponse<Employee>>('/NhanVien', data),
  update: (id: number, data: UpdateEmployeeRequest) => api.put<ApiResponse<Employee>>(`/NhanVien/${id}`, data),
  setStatus: (id: number, isActive: boolean) => api.patch<ApiResponse<null>>(`/NhanVien/${id}/status`, { id, isActive }),
  delete: (id: number, data: { ngayNghiViec: string; lyDo: string }) =>
    api.delete<ApiResponse<null>>(`/NhanVien/${id}`, { data }),
  getRoles: () => api.get<ApiResponse<Role[]>>('/NhanVien/roles'),
  getPermissions: (id: number) => api.get<ApiResponse<Permission[]>>(`/NhanVien/${id}/permissions`),
  updateRoles: (id: number, roleIds: number[]) => api.put<ApiResponse<null>>(`/NhanVien/${id}/roles`, {
    roleIds,
    ngayBatDau: new Date().toISOString().slice(0, 10),
  }),
};

export interface Role {
  id: number;
  tenVaiTro: string;
  moTa: string;
}

export interface Permission {
  id: number;
  tenQuyen: string;
  moTa: string;
}
