import type { ApiResponse, PagedResult } from "../../shared/type/common.type";
import { type BenhNhanListDto} from "../types/queue.examination.type";
import { api } from "../../shared/api/axios.api";


export const examinationApi = {
  getHangDoi: (params: { maBacSi: number; pageIndex?: number; pageSize?: number }) => {
    return api.get<ApiResponse<PagedResult<BenhNhanListDto>>>('/LuotKham/hang-doi', { params });
  },
};
