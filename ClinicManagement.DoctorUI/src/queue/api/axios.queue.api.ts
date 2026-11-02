import type { ApiResponse, PagedResult } from "../../shared/type/common.type";
import { type HangDoiDto } from "../type/queue.type";
import { api } from "../../shared/api/axios.api";

export const QueueApi = {
  getHangDoiExtended: (params: { maBacSi: number; pageIndex?: number; pageSize?: number }) => {
    return api.get<ApiResponse<PagedResult<HangDoiDto>>>('/LuotKham/hang-doi-list', { params });
    },
};

