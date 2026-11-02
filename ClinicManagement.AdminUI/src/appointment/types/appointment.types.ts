export interface LichHenDto {
  id: number;
  maBenhNhan: number;
  tenBenhNhan: string;
  soDienThoai: string;
  soCCCD: string;
  ngaySinh?: string;
  gioiTinh: string;
  diaChi: string;

  maBacSi: number;
  tenBacSi: string;
  maKhoa?: number;
  tenKhoa: string;
  maCoSo: number;
  tenCoSo: string;

  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  khungGio: string;
  ngayHen: string;

  trangThai: TrangThaiLichHen;
  trangThaiText: string;
  lyDo: string;
  nguonDat: string;

  chiPhiGiuCho: number;
  daThanhToanGiuCho: boolean;
  soPhieuThu?: string;
  ngayThanhToan?: string;
  nguoiThuTien?: number;
  tenNguoiThuTien?: string;
  ghiChuHuy?: string;

  maLuotKham?: number;
  soThuTuHangDoi?: number;
  createdAt: string;
}

export type TrangThaiLichHen =
  | 'CHO_XAC_NHAN'
  | 'DA_XAC_NHAN'
  | 'DA_DEN'
  | 'DANG_KHAM'
  | 'HOAN_THANH'
  | 'DA_HUY';

export interface TimeSlotDto {
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  label: string;
  soLuongDaDat: number;
  soLuongToiDa: number;
  conTrong: boolean;
}

export interface ThongKeLichHenDto {
  tongLichHen: number;
  choThuTien: number;
  daXacNhan: number;
  daTiepNhan: number;
  daHuy: number;
  tongTienDaThu: number;
}

export interface CreateLichHenRequest {
  maBenhNhan: number;
  maBacSi: number;
  maCoSo: number;
  maKhoa?: number;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  lyDo?: string;
  nguonDat?: string;
}

export interface TiepNhanLichHenResultDto {
  maLichHen: number;
  maLuotKham: number;
  soThuTu: number;
  maHoaDon: number;
  soHoaDon: string;
  soTienKhauTru: number;
  uuTienFastTrack: boolean;
  thongBao: string;
}

export interface AppointmentFilterParams {
  pageIndex: number;
  pageSize: number;
  maCoSo?: number;
  maBacSi?: number;
  tuNgay?: string;
  denNgay?: string;
  trangThai?: string;
  keyword?: string;
}
