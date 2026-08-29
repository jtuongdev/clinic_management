export interface BenhNhanListDto {
  id: number;
  maBenhNhanNoiBo: string;
  hoTen: string;
  gioiTinh: string;
  tuoi: number;
  dienThoai: string;
  maLuotKhamGanNhat: string;
  khoa: string;
  bacSi: string;
  trangThaiLuotKham: string;
  thoiGianBatDauKham: string | null; 
  soThuTu: number | null;            
}