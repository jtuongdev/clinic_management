
export interface KhoaDropdownDto {
  id: number;
  ma?: string;
  ten: string;
  maCoSo?: number;
}


export interface KhoaOverviewDto {
  maKhoa: number;
  tenKhoa: string;
  tongLuotKham: number;
  soLuotCho: number;
  soBacSi: number;
  trangThai: string; // "HoatDong", "QuaTai", "BinhThuong"
}