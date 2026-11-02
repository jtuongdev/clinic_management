// src/features/patient/type/create.patient.type.ts

export interface CreateBenhNhanRequest {
  ho: string;
  ten: string;
  ngaySinh: string; // "YYYY-MM-DD"
  gioiTinh: 'M' | 'F' | 'O';
  dienThoai: string;
  email?: string;
  soCCCD?: string;
  diaChi?: string;
  nguoiLienHeTen?: string;
  nguoiLienHeDienThoai?: string;
  maCoSo: number;
  maKhoa: number;
  maBacSi?: number;
  maPhongKham?: number;
  baoHiem?: {
    loaiBaoHiem: number; // 1,2,3,4
    tenNhaCungCap: string;
    soThe: string;
    ngayBatDau: Date;
    ngayKetThuc: Date;
    mucHuong: number;
  };
  tienSuBenhs?: {
    loaiTienSu: number; // 1,2,3,4,5
    ten: string;
    ghiChu: string;
  }[];
}