import { api } from '../../shared/api/axios.api';
import { ApiResponse , PagedResult} from '../../shared/types/common.types';

import { CoSoDto, KhoaDto, ThongKeLuotKhamDto, LuotKhamDangXuLyDto,
   PagedResultBenhNhan,
  ThongKeBenhNhanDto,
  PagedResultLuotKham,
  ThongKeKhamBenhDto,
  ChiDinhDichVuListDto,
  ThongKeChiDinhDichVuDto,
  ChiDinhDichVuChiTietDto,
  NhapKetQuaChiDinhRequest,
  TiepNhanChiDinhRequest,
  HuyChiDinhRequest,
 } from '../type/examination.types';
 
import { DonThuocListDto, ThongKeDonThuocDto, } from '../type/prescription.examination.type';
export const examinationApi = {
  completeExam: (visitId: number) =>
    api.post(`/LuotKham/${visitId}/complete`),

  getLuotKhamList: (params: {
    pageIndex?: number;
    pageSize?: number;
    maBenhNhan?: number;
    maBacSi?: number;
    maKhoa?: number;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    return api.get<ApiResponse<PagedResultLuotKham>>('/LuotKham', { params });
  },

  // Lấy thống kê khám bệnh
  getThongKeKhamBenh: (params?: { maCoSo?: number; maKhoa?: number }) => {
    return api.get<ApiResponse<ThongKeKhamBenhDto>>('/LuotKham/thong-ke-kham-benh', { params });
  },
  getCoSos: () => {
    return api.get<ApiResponse<CoSoDto[]>>('/CoSo/dropdown');
  },
  getKhoas: (maCoSo: number) => {
    return api.get<ApiResponse<KhoaDto[]>>('/Khoa/dropdown', { params: { maCoSo } });
  },
  getThongKe: (params?: { maCoSo?: number; maKhoa?: number }) => {
    return api.get<ApiResponse<ThongKeLuotKhamDto>>('/LuotKham/thong-ke', { params });
  },
  getLuotKhamDangXuLy: (params?: { maCoSo?: number; maKhoa?: number }) => {
    return api.get<ApiResponse<LuotKhamDangXuLyDto[]>>('/LuotKham/dang-xu-ly', { params });
  },
  // tab bệnh nhân 
  getBenhNhanList: (params: {
    pageIndex?: number;
    pageSize?: number;
    keyword?: string;
    trangThai?: string;
    maKhoa?: number;
    maCoSo?: number;
  }) => {
    return api.get<ApiResponse<PagedResultBenhNhan>>('/LuotKham/danh-sach-benh-nhan', { params });
  },
  getThongKeBenhNhan: (params?: { maCoSo?: number; maKhoa?: number }) => {
    return api.get<ApiResponse<ThongKeBenhNhanDto>>('/LuotKham/thong-ke-benh-nhan', { params });
  },

  // chỉ định dich vụ
  getChiDinhDichVuList: (params: {
  pageIndex?: number;
  pageSize?: number;
  maKhoa?: number;
  maBacSi?: number;
  maBenhNhan?: number;
  loaiDichVu?: string;
  trangThai?: string;
  fromDate?: string;
  toDate?: string;
  }) => {
    return api.get<ApiResponse<PagedResult<ChiDinhDichVuListDto>>>('/LuotKham/danh-sach-chi-dinh', { params });
  },

  getThongKeChiDinhDichVu: (params?: { maKhoa?: number; maBacSi?: number }) => {
    return api.get<ApiResponse<ThongKeChiDinhDichVuDto>>('/LuotKham/thong-ke-chi-dinh', { params });
  },

  getChiDinhChiTiet: (chiDinhId: number) => {
    return api.get<ApiResponse<ChiDinhDichVuChiTietDto>>(`/LuotKham/chi-dinh/${chiDinhId}/chi-tiet`);
  },

  tiepNhanChiDinh: (chiDinhId: number, data?: TiepNhanChiDinhRequest) => {
    return api.post<ApiResponse<any>>(`/LuotKham/chi-dinh/${chiDinhId}/tiep-nhan`, data || {});
  },

  nhapKetQuaChiDinh: (chiDinhId: number, data: NhapKetQuaChiDinhRequest) => {
    return api.post<ApiResponse<any>>(`/LuotKham/chi-dinh/${chiDinhId}/nhap-ket-qua`, data);
  },

  huyChiDinh: (chiDinhId: number, data?: HuyChiDinhRequest) => {
    return api.post<ApiResponse<any>>(`/LuotKham/chi-dinh/${chiDinhId}/huy`, data || {});
  },
  // ĐƠN THUỐC
  getDonThuocList: (params: {
  pageIndex?: number;
  pageSize?: number;
  maKhoa?: number;
  maBacSi?: number;
  maBenhNhan?: number;
  trangThai?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  return api.get<ApiResponse<PagedResult<DonThuocListDto>>>('/LuotKham/danh-sach-donthuoc', { params });
},

getThongKeDonThuoc: (params?: { maCoSo?: number; maKhoa?: number }) => {
  return api.get<ApiResponse<ThongKeDonThuocDto>>('/LuotKham/thong-ke-donthuoc', { params });
},

approvePrescription: (visitId: number, prescriptionId: number) =>
  api.post(`/luot-kham/${visitId}/don-thuoc/${prescriptionId}/approve`),

cancelPrescription: (visitId: number, prescriptionId: number) =>
  api.post(`/luot-kham/${visitId}/don-thuoc/${prescriptionId}/cancel`),

dispensePrescription: (prescriptionId: number, idempotencyKey: string) =>
  api.post('/inventory/prescriptions/' + prescriptionId + '/dispense', {
    idempotencyKey,
    note: 'Cấp thuốc tại quầy',
  }),
  
};