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
} from '../types/examination/index';

import { api } from "../../shared/api/axios.api";

export const examinationApi = {
  getHangDoi: (params: { maBacSi: number; pageIndex?: number; pageSize?: number }) => {
    return api.get<ApiResponse<PagedResult<BenhNhanListDto>>>('/LuotKham/hang-doi', { params });
  },

  startExam: (luotKhamId: number) => {
    return api.post<ApiResponse<StartExamResponse>>(`/LuotKham/${luotKhamId}/start-exam`);
  },
  //khambenh
  saveExamination: (luotKhamId: number, payload: SaveExaminationRequest) => {
    return api.post<ApiResponse<ExaminationResultResponse>>(`/LuotKham/${luotKhamId}/examination`, payload);
  },
   getExaminationDetail: (luotKhamId: number) => {
    return api.get<ApiResponse<ExaminationDetailResponse>>(`/LuotKham/${luotKhamId}/examination`);
  },

  getTreatmentSummary: (luotKhamId: number) => {
    return api.get<ApiResponse<TreatmentSummaryDto>>(`/LuotKham/${luotKhamId}/summary`);
  },

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
  //chuan doan
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
};