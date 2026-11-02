import { api } from '../../shared/api/axios.api';
import { type CoSoDropdownDto } from '../type/facility.type';
import { type ApiResponse } from '../../shared/types/common.types';

export const coSoApi = {
  getDropdown: () => {
    return api.get<ApiResponse<CoSoDropdownDto[]>>('/CoSo/dropdown');
  },
};