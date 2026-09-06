import { api } from '../../shared/api/axios.api';
import type { ApiResponse } from '../../shared/types/common.types';

export interface PayrollPeriod {
  id: number;
  thang: number;
  nam: number;
  tuNgay: string;
  denNgay: string;
  maKyChamCong?: number;
  trangThai: string;
  soBangLuong: number;
}
export interface PayrollLine {
  id: number;
  maNhanVien: number;
  tenNhanVien: string;
  luongCoBan: number;
  soNgayCong: number;
  soNgayNghiKhongLuong: number;
  tongPhuCap: number;
  tongKhauTru: number;
  thucLinh: number;
}
export interface PayrollDetail extends PayrollPeriod { bangLuongs: PayrollLine[]; }
export interface AttendancePeriodOption {
  id: number;
  tuNgay: string;
  denNgay: string;
  daKhoa: boolean;
}

export const payrollApi = {
  getPeriods: () => api.get<ApiResponse<PayrollPeriod[]>>('/payroll/periods'),
  getAttendancePeriods: () => api.get<ApiResponse<AttendancePeriodOption[]>>('/ChamCong/periods'),
  createPeriod: (data: { thang: number; nam: number; tuNgay: string; denNgay: string; maKyChamCong: number }) =>
    api.post<ApiResponse<PayrollPeriod>>('/payroll/periods', data),
  getDetail: (id: number) => api.get<ApiResponse<PayrollDetail>>(`/payroll/periods/${id}`),
  generate: (id: number) => api.post<ApiResponse<PayrollDetail>>(`/payroll/periods/${id}/generate`),
  approve: (id: number) => api.post<ApiResponse<PayrollPeriod>>(`/payroll/periods/${id}/approve`),
  close: (id: number) => api.post<ApiResponse<PayrollPeriod>>(`/payroll/periods/${id}/close`),
  pay: (id: number) => api.post<ApiResponse<PayrollPeriod>>(`/payroll/periods/${id}/pay`),
};
