import { api } from '../../shared/api/axios.api';
import type { ApiResponse } from '../../shared/type/common.type';
import type { ThongTinBenhNhanTrongLuotKhamDto } from '../types/examination/exam.types';

export const patientWorkspaceApi = {
  getThongTinBenhNhan: (luotKhamId: number) =>
    api.get<ApiResponse<ThongTinBenhNhanTrongLuotKhamDto | null>>(
      `/luotkham/benh-nhan/${luotKhamId}/thong-tin-benh-nhan`
    ),
};
