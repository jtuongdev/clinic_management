import type { ApiResponse, PagedResult } from "../../shared/type/common.type";
import type {
  BenhNhanListDto,
  ExaminationResultResponse,
  ICDOption,
  DiagnosisItem,
  LoaiTienSuOption,
  SaveExaminationRequest,
  StartExamResponse,
  ExaminationDetailResponse,
  TreatmentSummaryDto,
  ServiceOrderDto,
  ServiceOrderRequest,
  ServiceCatalogOption,
  DrugSearchResult,
  CreatePrescriptionRequest,
  DrugInteractionCheckRequest,
  DrugInteractionAlert,
} from '../types/examination/index';

import { api } from "../../shared/api/axios.api";

export const examinationApi = {
  getHangDoi: (params?: { maBacSi?: number; pageIndex?: number; pageSize?: number }) => {
    const cleanParams: Record<string, any> = { ...params };
    if (!cleanParams.maBacSi || cleanParams.maBacSi <= 0) {
      delete cleanParams.maBacSi;
    }
    return api.get<ApiResponse<PagedResult<BenhNhanListDto>>>('/LuotKham/hang-doi', { params: cleanParams });
  },

  startExam: (luotKhamId: number) => {
    return api.post<ApiResponse<StartExamResponse>>(`/LuotKham/${luotKhamId}/start-exam`);
  },

  // Khám bệnh & Sinh hiệu
  saveExamination: (luotKhamId: number, payload: SaveExaminationRequest) => {
    return api.post<ApiResponse<ExaminationResultResponse>>(`/LuotKham/${luotKhamId}/examination`, payload);
  },

  getExaminationDetail: (luotKhamId: number) => {
    return api.get<ApiResponse<ExaminationDetailResponse>>(`/LuotKham/${luotKhamId}/examination`);
  },

  getTreatmentSummary: (luotKhamId: number) => {
    return api.get<ApiResponse<TreatmentSummaryDto>>(`/LuotKham/${luotKhamId}/summary`);
  },

  // Cận lâm sàng & Dịch vụ
  getServiceCatalog: (loaiDichVu?: string) => {
    return api.get<ApiResponse<ServiceCatalogOption[]>>('/LuotKham/danh-muc-dich-vu', { params: { loaiDichVu } });
  },

  getServiceOrders: (luotKhamId: number) => {
    return api.get<ApiResponse<ServiceOrderDto[]>>(`/LuotKham/${luotKhamId}/chi-dinh-dich-vu`);
  },

  createServiceOrder: (luotKhamId: number, payload: ServiceOrderRequest) => {
    return api.post<ApiResponse<ServiceOrderDto>>(`/LuotKham/${luotKhamId}/chi-dinh-dich-vu`, payload);
  },

  updateServiceOrder: (luotKhamId: number, serviceId: number, payload: ServiceOrderRequest) => {
    return api.put<ApiResponse<ServiceOrderDto>>(`/LuotKham/${luotKhamId}/chi-dinh-dich-vu/${serviceId}`, payload);
  },

  deleteServiceOrder: (luotKhamId: number, serviceId: number) => {
    return api.delete<ApiResponse<null>>(`/LuotKham/${luotKhamId}/chi-dinh-dich-vu/${serviceId}`);
  },

  getLoaiTienSuOptions: () => {
    return api.get<ApiResponse<LoaiTienSuOption[]>>('/BenhNhan/loai-tien-su');
  },

  searchICD: (keyword?: string) => {
    return api.get<ApiResponse<ICDOption[]>>('/LuotKham/icd', { params: { keyword } });
  },

  // Chẩn đoán ICD-10
  getDiagnoses: (luotKhamId: number) => {
    return api.get<ApiResponse<DiagnosisItem[]>>(`/LuotKham/${luotKhamId}/diagnoses`);
  },

  createDiagnosis: (luotKhamId: number, payload: Omit<DiagnosisItem, 'id'>) => {
    return api.post<ApiResponse<DiagnosisItem>>(`/LuotKham/${luotKhamId}/diagnoses`, payload);
  },

  updateDiagnosis: (luotKhamId: number, diagnosisId: number, payload: DiagnosisItem) => {
    return api.put<ApiResponse<DiagnosisItem>>(`/LuotKham/${luotKhamId}/diagnoses/${diagnosisId}`, payload);
  },

  deleteDiagnosis: (luotKhamId: number, diagnosisId: number) => {
    return api.delete<ApiResponse<null>>(`/LuotKham/${luotKhamId}/diagnoses/${diagnosisId}`);
  },

  // Dược & Kê đơn thuốc (Ultra-fast Clinical Drug Search)
  searchDrugs: async (keyword?: string, maKho?: number) => {
    try {
      return await api.get<ApiResponse<DrugSearchResult[]>>('/duoc/thuoc/search', {
        params: { q: keyword, keyword, maKho, pageSize: 50 },
      });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Fallback sang /Thuoc/catalog nếu server Kestrel chưa được khởi động lại
        const res = await api.get<ApiResponse<any[]>>('/Thuoc/catalog', {
          params: { keyword, q: keyword, pageSize: 20 },
        });
        if (res.data?.success && Array.isArray(res.data.data)) {
          const mapped: DrugSearchResult[] = res.data.data.map((item: any) => ({
            id: item.id,
            maThuoc: item.maThuoc || item.ma || '',
            tenThuoc: item.tenThuoc || item.ten || '',
            hoatChat: item.hoatChat || '',
            hamLuong: item.hamLuong || '',
            donViTinh: item.donViTinh || 'Viên',
            duongDung: item.duongDung || 'Uống',
            tonKho: item.tonKho ?? 0,
            soLuongKhaDung: item.soLuongKhaDung ?? item.tonKho ?? 0,
            gia: item.gia,
            laThuocBHYT: item.laThuocBHYT ?? item.bhyt ?? false,
          }));
          return {
            ...res,
            data: {
              ...res.data,
              data: mapped,
            },
          };
        }
        return res;
      }
      throw err;
    }
  },

  getPrescription: (luotKhamId: number) => {
    return api.get<ApiResponse<any>>(`/luot-kham/${luotKhamId}/don-thuoc`);
  },

  createPrescription: (luotKhamId: number, payload: CreatePrescriptionRequest) => {
    return api.post<ApiResponse<any>>(`/luot-kham/${luotKhamId}/don-thuoc`, payload);
  },

  checkDrugInteractions: (payload: DrugInteractionCheckRequest) => {
    return api.post<ApiResponse<{ isSafe: boolean; status: string; alerts: DrugInteractionAlert[]; summary: string }>>('/ai/drug-interaction-check', payload);
  },

  // Hoàn tất & Khóa hồ sơ khám
  completeExam: (luotKhamId: number) => {
    return api.post<ApiResponse<{ success: boolean; message: string; hoaDonId?: number }>>(`/LuotKham/${luotKhamId}/complete`);
  },

  validateClinicalTransaction: (luotKhamId: number) => {
    return api.post<ApiResponse<{ isValid: boolean; message: string; errors: string[]; warnings: string[] }>>(`/clinical/transactions/${luotKhamId}/validate`);
  },

  getClinicalTransactionSummary: (luotKhamId: number) => {
    return api.get<ApiResponse<unknown>>(`/clinical/transactions/${luotKhamId}/summary`);
  },

  lockEmr: (luotKhamId: number, payload?: { lyDo?: string; chuKySo?: string }) => {
    return api.post<ApiResponse<any>>(`/luot-kham/${luotKhamId}/emr/lock`, payload);
  },

  completeAndLockExam: (luotKhamId: number, payload?: { lyDo?: string; chuKySo?: string }) => {
    return api.post<ApiResponse<{
      luotKhamId: number;
      trangThai: string;
      emrLocked: boolean;
      chuKySo: string;
      emrLockedAt?: string;
      hoaDonId?: number;
      soHoaDon: string;
      tongTien: number;
      message: string;
    }>>(`/LuotKham/${luotKhamId}/complete-and-lock`, payload);
  },

  sendToParaclinical: (luotKhamId: number) => {
    return api.post<ApiResponse<{ luotKhamId: number; trangThai: string; message: string }>>(`/LuotKham/${luotKhamId}/send-to-paraclinical`);
  },

  resumeExam: (luotKhamId: number) => {
    return api.post<ApiResponse<{ luotKhamId: number; trangThai: string; message: string }>>(`/LuotKham/${luotKhamId}/resume-exam`);
  },
};

