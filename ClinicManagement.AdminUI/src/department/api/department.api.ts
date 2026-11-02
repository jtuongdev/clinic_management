import { api } from '../../shared/api/axios.api';
import type { KhoaDropdownDto,KhoaOverviewDto } from '../type/department.type';
import { type ApiResponse } from '../../shared/types/common.types';

export const khoaApi = {
  getDropdown: (maCoSo: number) => {
    return api.get<ApiResponse<KhoaDropdownDto[]>>('/Khoa/dropdown', {
      params: { maCoSo },
    });
  },
  getKhoaOverview: (maCoSo?: number) => {
    return api.get<ApiResponse<KhoaOverviewDto[]>>('/Khoa/overview', { params: { maCoSo } });
  }
  
};