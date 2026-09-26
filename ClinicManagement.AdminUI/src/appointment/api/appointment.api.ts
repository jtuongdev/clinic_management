import { api } from '../../shared/api/axios.api';
import type { ApiResponse, PagedResult } from '../../shared/types/common.types';
import type {
  LichHenDto,
  TimeSlotDto,
  ThongKeLichHenDto,
  CreateLichHenRequest,
  TiepNhanLichHenResultDto,
  AppointmentFilterParams,
} from '../types/appointment.types';

export const appointmentApi = {
  // Lấy danh sách lịch hẹn phân trang & lọc
  getPaged: (params: AppointmentFilterParams) =>
    api.get<ApiResponse<PagedResult<LichHenDto>>>('/LichHen', { params }),

  // Lấy chi tiết lịch hẹn
  getById: (id: number) =>
    api.get<ApiResponse<LichHenDto>>(`/LichHen/${id}`),

  // Lấy danh sách slot khám 30 phút theo bác sĩ & ngày
  getSlots: (maBacSi: number, ngay?: string) =>
    api.get<ApiResponse<TimeSlotDto[]>>('/LichHen/slots', {
      params: { maBacSi, ngay },
    }),

  // Lấy thống kê lịch hẹn (KPI cards)
  getThongKe: (maCoSo?: number, ngay?: string) =>
    api.get<ApiResponse<ThongKeLichHenDto>>('/LichHen/thong-ke', {
      params: { maCoSo, ngay },
    }),

  // Tạo mới lịch hẹn & giữ chỗ
  create: (data: CreateLichHenRequest) =>
    api.post<ApiResponse<LichHenDto>>('/LichHen', data),

  // Xác nhận thu tiền mặt 100k tại quầy
  thuTienMat: (id: number, ghiChu?: string) =>
    api.post<ApiResponse<LichHenDto>>(`/LichHen/${id}/thu-tien-mat`, { ghiChu }),

  // Hủy lịch hẹn (Quy định: Cọc 100k KHÔNG HOÀN LẠI)
  huyLich: (id: number, lyDoHuy?: string) =>
    api.post<ApiResponse<LichHenDto>>(`/LichHen/${id}/huy`, { lyDoHuy }),

  // Tiếp đón bệnh nhân vào khám (Fast-track Queue chen STT #2 + Khấu trừ 100k vào hóa đơn)
  tiepNhan: (id: number) =>
    api.post<ApiResponse<TiepNhanLichHenResultDto>>(`/LichHen/${id}/tiep-nhan`),
};
