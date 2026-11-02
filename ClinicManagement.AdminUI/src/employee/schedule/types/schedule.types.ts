export interface Schedule {
  id: number;
  maNhanVien: number;
  maKhoa: number;
  tenKhoa: string;
  tenNhanVien: string;
  maCaTruc: number;
  maPhongKham?: number;
  maLichLamViecCoDinh?: number;
  nguonLich: string;
  trangThai: 'LAM_VIEC' | 'NGHI' | 'HUY';
  laNghiTheoNgay?: boolean;
  tenPhongKham?: string;
  tenCa: string;
  ngayLam: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  soGioLam: number;
  ghiChu: string;
}

export interface CreateScheduleRequest {
  maNhanVien: number;
  maKhoa: number;
  maCaTruc: number;
  maPhongKham?: number;
  ngayLam: string;
  ghiChu: string;
  trangThai?: 'LAM_VIEC' | 'NGHI' | 'HUY';
}

export interface UpdateScheduleRequest {
  maCaTruc: number;
  maPhongKham?: number;
  ngayLam: string;
  ghiChu: string;
  trangThai?: 'LAM_VIEC' | 'NGHI' | 'HUY';
}

export interface FixedSchedule {
  id: number;
  maNhanVien: number;
  tenNhanVien: string;
  maKhoa: number;
  tenKhoa: string;
  maCaTruc: number;
  tenCa: string;
  maPhongKham?: number;
  tenPhongKham: string;
  thuTrongTuan: number;
  isActive?: boolean;
  tuNgay: string;
  denNgay?: string;
  ghiChu: string;
}

export type CreateFixedScheduleRequest = Omit<FixedSchedule, 'id' | 'tenNhanVien' | 'tenKhoa' | 'tenCa' | 'tenPhongKham'>;

export interface FixedShiftItem {
  thuTrongTuan: number;
  maCaTruc: number;
  maPhongKham?: number;
}

export interface SetFixedScheduleRequest {
  maNhanVien: number;
  shifts: FixedShiftItem[];
}

export interface GenerateMonthlyScheduleRequest {
  thang: number;
  nam: number;
  maKhoa?: number;
  maNhanVien?: number;
}

export interface GenerateMonthlyScheduleResult {
  thang: number;
  nam: number;
  totalDays: number;
  totalSchedulesGenerated: number;
  totalSchedulesSkipped: number;
  totalEmployeesScheduled: number;
}
