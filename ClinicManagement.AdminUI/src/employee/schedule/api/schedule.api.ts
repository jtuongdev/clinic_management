import { api } from '../../../shared/api/axios.api';
import type { ApiResponse } from '../../../shared/types/common.types';
import type { CreateFixedScheduleRequest, CreateScheduleRequest, FixedSchedule, Schedule, UpdateScheduleRequest } from '../types/schedule.types';

export const scheduleApi = {
  getStatusCatalog: () => api.get<ApiResponse<StatusCatalog>>('/EnumCatalog/schedule-statuses'),
  getAttendanceStatusCatalog: () => api.get<ApiResponse<StatusCatalog>>('/EnumCatalog/attendance-statuses'),
  getLeaveStatusCatalog: () => api.get<ApiResponse<StatusCatalog>>('/EnumCatalog/leave-statuses'),
  get: (params: { fromDate: string; toDate: string; maNhanVien?: number; maKhoa?: number }) =>
    api.get<ApiResponse<Schedule[]>>('/LichLamViec', { params }),
  bulkCreate: (data: BulkScheduleRequest) =>
    api.post<ApiResponse<BulkScheduleResult>>('/LichLamViec/bulk', data),
  create: (data: CreateScheduleRequest) => api.post<ApiResponse<Schedule>>('/LichLamViec', data),
  update: (id: number, data: UpdateScheduleRequest) => api.put<ApiResponse<Schedule>>(`/LichLamViec/${id}`, data),
  remove: (id: number) => api.delete<ApiResponse<null>>(`/LichLamViec/${id}`),
  getEmployees: (maKhoa?: number, ngay?: string) => api.get<ApiResponse<{ items: Employee[] }>>('/NhanVien', {
    params: { pageIndex: 1, pageSize: 100, isActive: true, maKhoa, ngay },
  }),
  getShifts: () => api.get<ApiResponse<Shift[]>>('/CaTruc'),
  getFixed: (params: { maNhanVien?: number; maKhoa?: number }) =>
    api.get<ApiResponse<FixedSchedule[]>>('/LichLamViec/fixed', { params }),
  createFixed: (data: CreateFixedScheduleRequest) =>
    api.post<ApiResponse<FixedSchedule>>('/LichLamViec/fixed', data),
  bulkCreateFixed: (data: BulkFixedScheduleRequest) =>
    api.post<ApiResponse<BulkFixedScheduleResult>>('/LichLamViec/fixed/bulk', data),
  updateFixed: (id: number, data: CreateFixedScheduleRequest) =>
    api.put<ApiResponse<FixedSchedule>>(`/LichLamViec/fixed/${id}`, data),
  removeFixed: (id: number) => api.delete<ApiResponse<null>>(`/LichLamViec/fixed/${id}`),
  generate: (params: { tuNgay: string; denNgay: string; maKhoa?: number }) =>
    api.post<ApiResponse<number>>('/LichLamViec/generate', null, { params }),
  previewGenerate: (params: { tuNgay: string; denNgay: string; maKhoa?: number }) =>
    api.post<ApiResponse<GenerateSchedulePreview>>('/LichLamViec/preview-generate', null, { params }),
  getAttendance: (params: { fromDate: string; toDate: string; maNhanVien?: number }) =>
    api.get<ApiResponse<Attendance[]>>('/ChamCong', { params }),
  getKpiSummary: (params: { fromDate: string; toDate: string; maKhoa?: number; maNhanVien?: number }) =>
    api.get<ApiResponse<AttendanceKpiSummary>>('/ChamCong/kpi-summary', { params }),
  checkIn: (maLichLamViec: number) =>
    api.post<ApiResponse<Attendance>>('/ChamCong/check-in', { maLichLamViec }),
  checkOut: (maLichLamViec: number) =>
    api.post<ApiResponse<Attendance>>('/ChamCong/check-out', { maLichLamViec }),
  finalizeAbsent: () =>
    api.post<ApiResponse<number>>('/ChamCong/finalize-absent'),
  getAttendanceAdjustments: (params?: { fromDate?: string; toDate?: string; status?: string }) =>
    api.get<ApiResponse<AttendanceAdjustment[]>>('/ChamCong/adjustments', { params }),
  requestAttendanceAdjustment: (data: AttendanceAdjustmentRequest) =>
    api.post<ApiResponse<AttendanceAdjustment>>('/ChamCong/adjustments', data),
  approveAttendanceAdjustment: (id: number, ghiChu?: string) =>
    api.post<ApiResponse<AttendanceAdjustment>>(`/ChamCong/adjustments/${id}/approve`, { ghiChu }),
  rejectAttendanceAdjustment: (id: number, ghiChu?: string) =>
    api.post<ApiResponse<AttendanceAdjustment>>(`/ChamCong/adjustments/${id}/reject`, { ghiChu }),
  getAttendancePeriods: () =>
    api.get<ApiResponse<AttendancePeriod[]>>('/ChamCong/periods'),
  createAttendancePeriod: (data: CreateAttendancePeriodRequest) =>
    api.post<ApiResponse<AttendancePeriod>>('/ChamCong/periods', data),
  lockAttendancePeriod: (id: number) =>
    api.post<ApiResponse<AttendancePeriod>>(`/ChamCong/periods/${id}/lock`),
  unlockAttendancePeriod: (id: number) =>
    api.post<ApiResponse<AttendancePeriod>>(`/ChamCong/periods/${id}/unlock`),
  getLeaves: (params: { fromDate: string; toDate: string; maNhanVien?: number; trangThai?: string }) =>
    api.get<ApiResponse<LeaveRequest[]>>('/NghiPhep', { params }),
  createLeave: (data: CreateLeaveRequest) =>
    api.post<ApiResponse<LeaveRequest>>('/NghiPhep', data),
  reviewLeave: (id: number, approved: boolean, ghiChu?: string) =>
    api.post<ApiResponse<LeaveRequest>>(`/NghiPhep/${id}/review`, { ghiChu }, { params: { approved } }),
  cancelLeave: (id: number) =>
    api.post<ApiResponse<LeaveRequest>>(`/NghiPhep/${id}/cancel`),
  getAdjustments: (scheduleId: number) =>
    api.get<ApiResponse<ScheduleAdjustment[]>>(`/LichLamViec/${scheduleId}/adjustments`),
};
export interface StatusCatalogItem { code: string; label: string; }
export type StatusCatalog = StatusCatalogItem[];

export interface Employee { id: number; hoTen: string; username: string; }
export interface BulkScheduleRequest {
  maNhanVien: number[];
  maKhoa: number;
  maCaTruc: number;
  tuNgay: string;
  denNgay: string;
  thuTrongTuan?: number[];
  ghiChu?: string;
}
export interface BulkScheduleResult { createdCount: number; skippedDates: string[]; }
export interface BulkFixedScheduleRequest { items: CreateFixedScheduleRequest[]; }
export interface BulkFixedScheduleResult { createdCount: number; duplicateCount: number; unassignedEmployeeCount: number; skippedCount: number; }
export interface GenerateSchedulePreview {
  expectedCount: number;
  existingCount: number;
  conflictCount: number;
  unassignedEmployeeCount: number;
  outsideEffectiveRangeCount: number;
}
export interface Shift { id: number; tenCa: string; thoiGianBatDau: string; thoiGianKetThuc: string; }
export interface Attendance {
  id: number;
  maLichLamViec?: number;
  checkIn?: string;
  checkOut?: string;
  gioLamThucTe: number;
  phutDiMuon: number;
  phutVeSom: number;
  trangThai: 'CHUA_CHAM_CONG' | 'DI_DUNG_GIO' | 'DI_MUON' | 'VE_SOM' | 'DI_MUON_VE_SOM' | 'NGHI_PHEP' | 'VANG_MAT' | 'THIEU_CHECK_OUT' | 'CHO_XAC_NHAN';
}
export interface AttendanceKpiSummary {
  tongLich: number;
  lichLamViec: number;
  lichNghi: number;
  lichHuy: number;
  tongChamCong: number;
  daCheckIn: number;
  daCheckOut: number;
  thieuCheckOut: number;
  choXacNhan: number;
  vangMat: number;
  nghiPhep: number;
  diDungGio: number;
  diMuon: number;
  tongGioLam: number;
}
export interface AttendanceAdjustment {
  id: number;
  maChamCong: number;
  maNhanVien: number;
  checkInCu?: string;
  checkOutCu?: string;
  checkInMoi?: string;
  checkOutMoi?: string;
  lyDo: string;
  trangThai: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
  nguoiDuyet?: number;
  thoiGianDuyet?: string;
  ghiChuDuyet?: string;
}
export interface AttendanceAdjustmentRequest {
  maChamCong: number;
  checkIn?: string | null;
  checkOut?: string | null;
  lyDo: string;
}
export interface AttendancePeriod {
  id: number;
  tuNgay: string;
  denNgay: string;
  daKhoa: boolean;
  nguoiKhoa?: number;
  thoiGianKhoa?: string;
  ghiChu: string;
}
export interface CreateAttendancePeriodRequest {
  tuNgay: string;
  denNgay: string;
  ghiChu?: string;
}
export interface LeaveRequest {
  id: number;
  maNhanVien: number;
  tenNhanVien: string;
  tuNgay: string;
  denNgay: string;
  loaiNghi: string;
  lyDo: string;
  trangThai: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI' | 'HUY';
  ngayDuyet?: string;
}
export interface CreateLeaveRequest {
  maNhanVien: number;
  tuNgay: string;
  denNgay: string;
  loaiNghi: string;
  lyDo: string;
}
export interface ScheduleAdjustment {
  id: number;
  maLichLamViec: number;
  caCu?: number;
  caMoi?: number;
  phongCu?: number;
  phongMoi?: number;
  trangThaiCu: string;
  trangThaiMoi: string;
  lyDo: string;
  nguoiThucHien: number;
  thoiDiem: string;
}
