
// ClinicManagement.AdminUl › src › patient › type › TS profile.patient.type.ts › o BenhNhanProfileDto >\

export interface TaiKhoanDto {
  username: string;
  hasPassword: boolean;
  lastLogin: string | null;
  isLocked: boolean;
  roles: string[];
}

export interface ThongTinTongQuanDto {
  tongLuotKham: number;
  tongHoaDon: number;
  tongTienDaThanhToan: number;
  tongTienConNo: number;
  soLanKhamGanNhat: number;
  trangThaiHienTai: string;
}

export interface BaoHiemDto {
  id: number;
  loaiBaoHiem: string;
  tenNhaCungCap: string;
  soThe: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  mucHuong: number;
  isValid: boolean;
}

export interface TienSuBenhDto {
  id: number;
  loaiTienSu: string;
  ten: string;
  ghiChu: string;
  ngayGhiNhan: string;
}

export interface LuotKhamSummaryDto {
  id: number;
  ngayKham: string;
  trangThai: string;
  bacSi: string;
  khoa: string;
  lyDoKham: string;
  chanDoanChinh: string;
}

export interface HoaDonSummaryDto {
  id: number;
  soHoaDon: string;
  ngayLap: string;
  tongTien: number;
  daThanhToan: number;
  trangThai: string;
  conNo: number;
}

export interface BenhNhanProfileDto {
  id: number;
  ho: string;
  ten: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  dienThoai: string;
  email: string;
  soCCCD: string;
  diaChi: string;
  nguoiLienHeTen: string;
  nguoiLienHeDienThoai: string;
  createdAt: string;
  isDeleted: boolean;
  maBenhNhanNoiBo: string;
  maCoSo: number;
  tenCoSo: string;
  ngayDangKy: string;
  taiKhoan: TaiKhoanDto;
  nguoiTao: any | null;
  thongTinTongQuan: ThongTinTongQuanDto;
  baoHiems: BaoHiemDto[];
  tienSuBenhs: TienSuBenhDto[];
  luotKhamGanNhat: LuotKhamSummaryDto[];
  hoaDonGanNhat: HoaDonSummaryDto[];
}
