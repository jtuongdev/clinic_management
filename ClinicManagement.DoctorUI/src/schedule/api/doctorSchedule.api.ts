import { api } from '../../shared/api/axios.api';

export interface ScheduleItemDto {
  id: number;
  maNhanVien: number;
  tenNhanVien: string;
  maKhoa: number;
  tenKhoa: string;
  maCaTruc: number;
  tenCa: string;
  maPhongKham?: number;
  tenPhongKham?: string;
  maLichLamViecCoDinh?: number;
  nguonLich: string; // "TU_DONG_THEO_LICH_MAU" | "PHAT_SINH_THU_CONG" | "DOI_CA"
  trangThai: string; // "LAM_VIEC" | "NGHI_PHEP"
  laNghiTheoNgay: boolean;
  ngayLam: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  soGioLam: number;
  ghiChu: string;
}

export interface AttendanceItemDto {
  id: number;
  maNhanVien: number;
  maLichLamViec?: number;
  tenNhanVien: string;
  tenCa: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  ngayChamCong: string;
  checkIn?: string;
  checkOut?: string;
  gioLamThucTe?: number;
  phutDiMuon?: number;
  phutVeSom?: number;
  trangThai: string; // "DUNG_GIO" | "DI_MUON" | "VE_SOM" | "DI_MUON_VE_SOM" | "VANG_MAT"
  ghiChu?: string;
}

export interface DoctorShiftItemDto {
  id: number;
  maCaTruc: number;
  tenCa: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  tenKhoa: string;
  tenPhongKham: string;
  nguonLich: string;
  trangThaiLich: string;
  checkIn?: string;
  checkOut?: string;
  trangThaiChamCong: string;
  isCurrentActive: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  isExpired: boolean;
}

export interface TodayStatusDto {
  date: string;
  hasSchedule: boolean;
  schedule?: ScheduleItemDto | null;
  attendance?: AttendanceItemDto | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  shifts?: DoctorShiftItemDto[];
}

export interface PayslipItemDto {
  id: number;
  maKyLuong: number;
  thang: number;
  nam: number;
  trangThaiKyLuong: string;
  maNhanVien: number;
  tenNhanVien: string;
  luongCoBan: number;
  soNgayCong: number;
  soNgayNghiKhongLuong: number;
  tongPhuCap: number;
  tongKhauTru: number;
  thucLinh: number;
  tienNoKyNay: number;
  luongTheoNgayCong: number;
  khauTruNghiKhongLuong: number;
  tienTangCa: number;
  khauTruDiMuonVeSom: number;
  tienBaoHiem: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const doctorScheduleApi = {
  // Check-in tự động khớp ca hoặc theo ca chỉ định
  async checkIn(note?: string, maLichLamViec?: number): Promise<ApiResponse<AttendanceItemDto>> {
    const res = await api.post<ApiResponse<AttendanceItemDto>>('/ChamCong/check-in', {
      maNhanVien: 0, // Server tự lấy CurrentUserId
      ghiChu: note || '',
      maLichLamViec: maLichLamViec || null,
    });
    return res.data;
  },

  // Check-out tự động khớp ca đang mở
  async checkOut(note?: string): Promise<ApiResponse<AttendanceItemDto>> {
    const res = await api.post<ApiResponse<AttendanceItemDto>>('/ChamCong/check-out', {
      maNhanVien: 0,
      ghiChu: note || '',
    });
    return res.data;
  },

  // Trạng thái ca và chấm công hôm nay của bác sĩ
  async getTodayStatus(): Promise<ApiResponse<TodayStatusDto>> {
    const res = await api.get<ApiResponse<TodayStatusDto>>('/ChamCong/today-status');
    return res.data;
  },

  // Lịch làm việc cá nhân của bác sĩ
  async getMySchedule(fromDate?: string, toDate?: string): Promise<ApiResponse<ScheduleItemDto[]>> {
    const res = await api.get<ApiResponse<ScheduleItemDto[]>>('/LichLamViec/my-schedule', {
      params: { fromDate, toDate },
    });
    return res.data;
  },

  // Lịch sử chấm công cá nhân
  async getMyAttendance(fromDate?: string, toDate?: string): Promise<ApiResponse<AttendanceItemDto[]>> {
    const res = await api.get<ApiResponse<AttendanceItemDto[]>>('/ChamCong/my-attendance', {
      params: { fromDate, toDate },
    });
    return res.data;
  },

  // Bảng lương cá nhân
  async getMyPayslips(): Promise<ApiResponse<PayslipItemDto[]>> {
    const res = await api.get<ApiResponse<PayslipItemDto[]>>('/payroll/my-payslips');
    return res.data;
  },
};
