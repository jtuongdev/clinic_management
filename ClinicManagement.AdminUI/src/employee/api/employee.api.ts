import { api } from '../../shared/api/axios.api';
import type { ApiResponse, PagedResult } from '../../shared/types/common.types';
import type { ChucVuDto, CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../types/employee.types';
import type { KhoaDropdownDto } from '../../department/type/department.type';
import type { PhongKhamDropdownDto } from '../../clinic/type/drow.clinic.type';

export const employeeApi = {
  getPaged: (params: {
    pageIndex: number;
    pageSize: number;
    keyword?: string;
    isActive?: boolean;
    maKhoa?: number;
    maChucVu?: number;
  }) => api.get<ApiResponse<PagedResult<Employee>>>('/NhanVien', { params }),
  getById: (id: number) => api.get<ApiResponse<Employee>>(`/NhanVien/${id}`),
  create: (data: CreateEmployeeRequest) => api.post<ApiResponse<Employee>>('/NhanVien', data),
  update: (id: number, data: UpdateEmployeeRequest) => api.put<ApiResponse<Employee>>(`/NhanVien/${id}`, data),
  setStatus: (id: number, isActive: boolean) => api.patch<ApiResponse<null>>(`/NhanVien/${id}/status`, { id, isActive }),
  delete: (id: number, data: { ngayNghiViec: string; lyDo: string }) =>
    api.delete<ApiResponse<null>>(`/NhanVien/${id}`, { data }),
  getPositions: () => api.get<ApiResponse<ChucVuDto[]>>('/NhanVien/positions'),
  getDepartments: (maCoSo?: number) =>
    api.get<ApiResponse<KhoaDropdownDto[]>>('/Khoa/dropdown', {
      params: maCoSo ? { maCoSo } : undefined,
    }),
  getRooms: (maKhoa?: number) =>
    api.get<ApiResponse<PhongKhamDropdownDto[]>>('/PhongKham/dropdown', {
      params: maKhoa ? { maKhoa } : undefined,
    }),
  getRoles: () => api.get<ApiResponse<Role[]>>('/NhanVien/roles'),
  getPermissions: (id: number) => api.get<ApiResponse<Permission[]>>(`/NhanVien/${id}/permissions`),
  updateRoles: (id: number, roleIds: number[]) => api.put<ApiResponse<null>>(`/NhanVien/${id}/roles`, {
    roleIds,
    ngayBatDau: new Date().toISOString().slice(0, 10),
  }),
  getLookup: (params?: {
    maKhoa?: number;
    chucVu?: string;
    maChucVu?: number;
    maCoSo?: number;
    keyword?: string;
    isActive?: boolean;
  }) => api.get<ApiResponse<EmployeeLookupDto[]>>('/NhanVien/lookup', { params }),
};

export interface EmployeeLookupDto {
  id: number;
  maNhanVien: string;
  hoTen: string;
  chucVu: string;
  vaiTro?: string;
  maKhoa?: number;
  tenKhoa?: string;
  trangThaiHoatDong: boolean;
  isActive: boolean;
}

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
