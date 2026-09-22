import { api } from '../../../shared/api/axios.api';
import { BacSiDto, BacSiTrucDto } from '../type/docter.type';
import { type ApiResponse } from '../../../shared/types/common.types';

export const BacSiApi = {
  getBacSiByKhoa: (maKhoa: number, maCoSo?: number) => {
    return api.get<ApiResponse<BacSiDto[]>>('/NhanVien/bac-si', {
      params: { maKhoa, maCoSo },
    });
  },
  getBacSiTruc: (params?: { maCoSo?: number; maKhoa?: number }) => {
    return api.get<ApiResponse<BacSiTrucDto[]>>('/NhanVien/bac-si-truc', { params });
  },
};