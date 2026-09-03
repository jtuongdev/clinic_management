export interface Schedule {
  id: number;
  maNhanVien: number;
  tenNhanVien: string;
  maCaTruc: number;
  tenCa: string;
  ngayLam: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  soGioLam: number;
  ghiChu: string;
}

export interface CreateScheduleRequest {
  maNhanVien: number;
  maCaTruc: number;
  ngayLam: string;
  ghiChu: string;
}

export interface UpdateScheduleRequest {
  maCaTruc: number;
  ngayLam: string;
  ghiChu: string;
}
