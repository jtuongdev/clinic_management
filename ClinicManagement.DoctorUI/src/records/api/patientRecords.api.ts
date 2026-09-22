import { api } from '../../shared/api/axios.api';
import type { ApiResponse, PagedResult } from '../../shared/type/common.type';

export interface BenhNhanRecordDto {
  id: number;
  ho: string;
  ten: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  dienThoai: string;
  email: string;
  soCCCD: string;
  diaChi: string;
  nguoiLienHeTen: string;
  nguoiLienHeDienThoai: string;
  createdAt: string;
  maBenhNhanNoiBo: string;
  tenKhoa: string;
  trangThaiLuotKham: string;
  tienSuBenhs?: Array<{
    id: number;
    loaiTienSu: string;
    ten: string;
    ghiChu: string;
    ngayGhiNhan: string;
  }>;
  baoHiems?: Array<{
    id: number;
    loaiBaoHiem: string;
    tenNhaCungCap: string;
    soThe: string;
    mucHuong: number;
    isValid: boolean;
    ngayBatDau?: string;
    ngayKetThuc?: string;
  }>;
}

export interface PatientVisitHistoryDto {
  id: number;
  ngayKham: string;
  trangThai: string;
  hinhThucDieuTri: string;
  lyDoKham: string;
  tenPhongKham: string;
  thoiGianBatDauKham?: string;
  thoiGianKetThucKham?: string;
  bacSi: string;
  chuyenKhoaBacSi: string;
  khoa: string;
}

export const patientRecordsApi = {
  getPaged: (params?: { pageIndex?: number; pageSize?: number; keyword?: string }) => {
    return api.get<ApiResponse<PagedResult<BenhNhanRecordDto>>>('/BenhNhan/paged', { params });
  },

  getProfile: (id: number) => {
    return api.get<ApiResponse<BenhNhanRecordDto>>(`/BenhNhan/${id}/profile`);
  },

  getVisits: (id: number, params?: { pageIndex?: number; pageSize?: number }) => {
    return api.get<ApiResponse<PagedResult<PatientVisitHistoryDto>>>(`/BenhNhan/${id}/visits`, { params });
  },

  getPrescriptions: (id: number, params?: { pageIndex?: number; pageSize?: number }) => {
    return api.get<ApiResponse<any>>(`/BenhNhan/${id}/prescriptions`, { params });
  },
};
