import { api } from '../../shared/api/axios.api';
import type { ApiResponse } from '../../shared/types/common.types';
import type { CreateScheduleRequest, Schedule, UpdateScheduleRequest } from '../types/schedule.types';

export const scheduleApi = {
  get: (params: { fromDate: string; toDate: string; maNhanVien?: number }) =>
    api.get<ApiResponse<Schedule[]>>('/LichLamViec', { params }),
  create: (data: CreateScheduleRequest) => api.post<ApiResponse<Schedule>>('/LichLamViec', data),
  update: (id: number, data: UpdateScheduleRequest) => api.put<ApiResponse<Schedule>>(`/LichLamViec/${id}`, data),
  remove: (id: number) => api.delete<ApiResponse<null>>(`/LichLamViec/${id}`),
  getEmployees: () => api.get<ApiResponse<{ items: Employee[] }>>('/NhanVien', { params: { pageIndex: 1, pageSize: 100, isActive: true } }),
  getShifts: () => api.get<ApiResponse<Shift[]>>('/CaTruc'),
};

export interface Employee { id: number; hoTen: string; username: string; }
export interface Shift { id: number; tenCa: string; thoiGianBatDau: string; thoiGianKetThuc: string; }
