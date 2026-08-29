import { api } from '../../../shared/api/axios.api';
import { BacSiDto } from '../type/docter.type';
import { type ApiResponse } from '../../../shared/types/common.types';
import { type BacSiTrucDto } from '../type/docter.type';

export const BacSiApi = {
  getBacSiByKhoa: (maKhoa: number) => {
    return api.get<ApiResponse<BacSiDto[]>>('/NhanVien/bac-si', {
      params: { maKhoa },
    });
  },
  getBacSiTruc: (params?: { maCoSo?: number; maKhoa?: number }) => {
    return api.get<ApiResponse<BacSiTrucDto[]>>('/NhanVien/bac-si-truc', { params });
  },
};