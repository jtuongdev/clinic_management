import type { ApiResponse, PagedResult } from "../../shared/type/common.type";
import type {
  BenhNhanListDto,
  ExaminationResultResponse,
  LoaiTienSuOption,
  SaveExaminationRequest,
  StartExamResponse,
} from '../types/examination.types';
import { api } from "../../shared/api/axios.api";

export const examinationApi = {
  getHangDoi: (params: { maBacSi: number; pageIndex?: number; pageSize?: number }) => {
    return api.get<ApiResponse<PagedResult<BenhNhanListDto>>>('/LuotKham/hang-doi', { params });
  },

  startExam: (luotKhamId: number) => {
    return api.post<ApiResponse<StartExamResponse>>(`/LuotKham/${luotKhamId}/start-exam`);
  },

  /**
   * Lưu dữ liệu khám bệnh (lý do khám, sinh hiệu, chẩn đoán ban đầu)
   */
  saveExamination: (luotKhamId: number, payload: SaveExaminationRequest) => {
    return api.post<ApiResponse<ExaminationResultResponse>>(`/LuotKham/${luotKhamId}/examination`, payload);
  },

  getLoaiTienSuOptions: () => {
    return api.get<ApiResponse<LoaiTienSuOption[]>>('/BenhNhan/loai-tien-su');
  },
};
