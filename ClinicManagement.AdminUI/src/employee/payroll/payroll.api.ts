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

export interface ChiTietBangLuong {
  id: number;
  maBangLuong: number;
  loaiKhoan: 'PHU_CAP' | 'KHAU_TRU';
  tenKhoan: string;
  soTien: number;
  ghiChu: string;
}

export interface PayrollSummaryKpi {
  tongQuyLuong: number;
  tongLuongCoBan: number;
  tongLamThemOT: number;
  tongBaoHiem: number;
  tongThucLinh: number;
  tongPhuCap: number;
  tongKhauTru: number;
  soNhanVien: number;
  soNhanVienPhatSinhNo: number;
  tongTienNoKyNay: number;
}

export interface AttendanceDrillDownItem {
  ngay: string;
  tenCa: string;
  gioVao?: string;
  gioRa?: string;
  phutDiMuon: number;
  phutVeSom: number;
  soGioLamThucTe: number;
  soGioOT: number;
  trangThai: string;
  loaiCong: string;
  ghiChu: string;
}

export interface AddItemRequest {
  loaiKhoan: 'PHU_CAP' | 'KHAU_TRU';
  tenKhoan: string;
  soTien: number;
  ghiChu?: string;
}

export interface PayrollLine {
  id: number;
  maKyLuong: number;
  thang: number;
  nam: number;
  trangThaiKyLuong: string;
  maNhanVien: number;
  tenNhanVien: string;
  tenKhoa?: string;
  chucDanh?: string;
  maChucVu?: number;
  luongCoBan: number;
  soNgayCong: number;
  soNgayNghiKhongLuong: number;
  tongPhuCap: number;
  tongKhauTru: number;
  thucLinh: number;
  tienNoKyNay: number;
  luongTheoNgayCong: number;
  khauTruNghiKhongLuong: number;
  tienTangCa: number;
  khauTruDiMuonVeSom: number;
  tienBaoHiem: number;
  soCaBatThuong?: number;
  soCaThieuCheckOut?: number;
  soCaVangMat?: number;
  chiTiets?: ChiTietBangLuong[];
}

export interface PayrollDetail extends PayrollPeriod {
  bangLuongs: PayrollLine[];
  soNhanVienPhatSinhNo?: number;
  tongTienNoKyNay?: number;
  kpi?: PayrollSummaryKpi;
}

export interface AttendancePeriodOption {
  id: number;
  tuNgay: string;
  denNgay: string;
  daKhoa: boolean;
  soNhanVien?: number;
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
  addItem: (bangLuongId: number, data: AddItemRequest) =>
    api.post<ApiResponse<PayrollLine>>(`/payroll/bang-luong/${bangLuongId}/items`, data),
  removeItem: (bangLuongId: number, itemId: number) =>
    api.delete<ApiResponse<PayrollLine>>(`/payroll/bang-luong/${bangLuongId}/items/${itemId}`),
  recalculate: (bangLuongId: number) =>
    api.post<ApiResponse<PayrollLine>>(`/payroll/bang-luong/${bangLuongId}/recalculate`),
  getAttendanceDrillDown: (bangLuongId: number) =>
    api.get<ApiResponse<AttendanceDrillDownItem[]>>(`/payroll/bang-luong/${bangLuongId}/attendance-drilldown`),
};
