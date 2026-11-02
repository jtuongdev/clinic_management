import { api } from '../../shared/api/axios.api';
import { ApiResponse } from '../../shared/types/common.types';
import {
  ExaminationFacilityDepartment,
  ExaminationFacilityLocation,
  ExaminationFacilityRoom,
} from '../type/facility.examination.type';

interface FacilityRoomResponse {
  id: number;
  ma: string;
  ten: string;
  maKhoa: number;
  tenKhoa: string;
  trangThai: string;
}

export const facilityExaminationApi = {
  getLocations: () =>
    api.get<ApiResponse<ExaminationFacilityLocation[]>>('/CoSo/dropdown'),

  getDepartments: (locationId?: number) =>
    api.get<ApiResponse<ExaminationFacilityDepartment[]>>('/Khoa/overview', {
      params: { maCoSo: locationId },
    }),

  getRoomsByDepartment: (departmentId: number) =>
    api.get<ApiResponse<FacilityRoomResponse[]>>(`/PhongKham/by-khoa/${departmentId}`),
};
