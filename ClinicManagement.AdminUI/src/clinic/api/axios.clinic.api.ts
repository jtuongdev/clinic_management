import { api } from '../../shared/api/axios.api';
import { ApiResponse } from '../../shared/types/common.types';
import { PhongKhamDropdownDto } from '../type/drow.clinic.type';
export const clinicApi = {

  getDropdownPhongKhamByKhoa: (maKhoa: number) => {
    return api.get<ApiResponse<PhongKhamDropdownDto[]>>(`/PhongKham/by-khoa/${maKhoa}`);
  },
};