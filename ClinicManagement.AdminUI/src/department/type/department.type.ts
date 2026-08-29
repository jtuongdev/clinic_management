
export interface KhoaDropdownDto {
  id: number;
  ten: string;
}


export interface KhoaOverviewDto {
  maKhoa: number;
  tenKhoa: string;
  tongLuotKham: number;
  soLuotCho: number;
  soBacSi: number;
  trangThai: string; // "HoatDong", "QuaTai", "BinhThuong"
}