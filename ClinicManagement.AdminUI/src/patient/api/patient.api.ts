import {api} from '../../shared/api/axios.api'
import {type ApiResponse } from '../../shared/types/common.types'
import type {ThongKeBenhNhan} from'../type/count.patient.type'
import type { CreateBenhNhanRequest} from '../type/create.patient.type';
import type { BenhNhanDto } from '../type/patient.types';
import { type BenhNhanProfileDto } from '../type/profile.patient.type';
import type { PagedResultVisits } from '../type/visit.patient.type';


export const patientApi = {

  getPaged: (params: { pageIndex: number; pageSize: number; keyword?: string; includeDeleted?: boolean }) => {
    return api.get<ApiResponse<{ items: BenhNhanDto[]; totalCount: number }>>('/BenhNhan/paged', { params });
  },
  getThongKe: () =>
    api.get<ApiResponse<ThongKeBenhNhan>>(
      '/BenhNhan/count/benhnhan/thongke'
    ),
  search: (keyword: string) => {
    return api.get<ApiResponse<BenhNhanDto[]>>('/BenhNhan/search', {
      params: { keyword },
    });
  },
  createBenhNhan: (data: CreateBenhNhanRequest) =>
    api.post<ApiResponse<BenhNhanDto>>(
      '/BenhNhan',
      data
    ),
    
};
