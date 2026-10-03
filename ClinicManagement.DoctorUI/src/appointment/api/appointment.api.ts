import { api } from '../../shared/api/axios.api';

export interface LichHenDto {
  id: number;
  maBenhNhan: number;
  tenBenhNhan: string;
  soDienThoai: string;
  soCCCD: string;
  ngaySinh?: string;
  gioiTinh: string;
  diaChi: string;

  maBacSi: number;
  tenBacSi: string;
  maKhoa?: number;
  tenKhoa: string;
  maCoSo: number;
  tenCoSo: string;

  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  khungGio: string;
  ngayHen: string;

  trangThai: string; // 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'DA_DEN' | 'DA_HUY'
  trangThaiText: string;
  lyDo: string;
  nguonDat: string;

  chiPhiGiuCho: number;
  daThanhToanGiuCho: boolean;
  soPhieuThu?: string;
  ngayThanhToan?: string;
  nguoiThuTien?: number;
  tenNguoiThuTien?: string;
  ghiChuHuy?: string;

  maLuotKham?: number;
  soThuTuHangDoi?: number;
  createdAt: string;
}

export interface ThongKeLichHenDto {
  tongLichHen: number;
  choThuTien: number;
  daXacNhan: number;
  daTiepNhan: number;
  daHuy: number;
  tongTienDaThu: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface GetAppointmentsParams {
  maCoSo?: number;
  maBacSi?: number;
  tuNgay?: string;
  denNgay?: string;
  trangThai?: string;
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface TiepNhanResultDto {
  maLichHen: number;
  maLuotKham: number;
  soThuTu: number;
  maHoaDon: number;
  soHoaDon: string;
  soTienKhauTru: number;
  uuTienFastTrack: boolean;
  thongBao: string;
}

export const appointmentApi = {
  getAppointments: async (params: GetAppointmentsParams = {}) => {
    return api.get<{ success: boolean; data: PagedResult<LichHenDto>; message: string }>('/LichHen', {
      params,
    });
  },

  getAppointmentById: async (id: number) => {
    return api.get<{ success: boolean; data: LichHenDto; message: string }>(`/LichHen/${id}`);
  },

  getStats: async (maBacSi?: number, ngay?: string, maCoSo?: number) => {
    return api.get<{ success: boolean; data: ThongKeLichHenDto; message: string }>('/LichHen/thong-ke', {
      params: { maBacSi, ngay, maCoSo },
    });
  },

  tiepNhan: async (id: number) => {
    return api.put<{ success: boolean; data: TiepNhanResultDto; message: string }>(`/LichHen/${id}/tiep-nhan`);
  },

  huyLichHen: async (id: number, lyDo: string) => {
    return api.put<{ success: boolean; message: string }>(`/LichHen/${id}/huy`, { lyDo });
  },
};
