export type PatientStatus = 'CHO_KHAM' | 'DANG_KHAM' | 'DA_KHAM' | 'KET_LUAN' | 'HOAN_THANH' | 'DA_HUY';

export interface Patient {
  id: number;
  maBN: string;      
  name: string;      
  gender: 'M' | 'F';  
  dob: string;       
  phone: string;      
  dept: string;      
  status: PatientStatus; 
}


export interface KPIStats {
  total: number;
  newPatients: number;
  active: number;
  discharged: number;
  waiting: number;
  rate: number;
}

export interface DepartmentStat {
  name: string;
  count: number;
}

export interface GenderStat {
  male: number;
  female: number;
  total: number;
}

export interface TodayStat {
  today: number;
  treating: number;
  waiting: number;
}


export interface TienSuBenhDto {
  id: number;
  loaiTienSu: string;
  ten: string;
  ghiChu: string;
  ngayGhiNhan: string; 
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

export interface BenhNhanDto {
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
  tenKhoa: string;
  trangThaiLuotKham: PatientStatus;
  tienSuBenhs: TienSuBenhDto[];
  baoHiems: BaoHiemDto[];
}
