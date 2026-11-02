// Đơn thuốc
export interface DonThuocListDto {
  id: number;
  maBenhNhanNoiBo: string;
  tenBenhNhan: string;
  tenBacSi: string;
  tenKhoa: string;
  trangThai: string;
  soLuongThuoc: number;
  tongTien: number;
  ngayKe: string;
  ngayCapThuoc: string | null;
  maLuotKham: number;
  maBenhNhan: number;
  maBacSi: number;
  maCoSo: number;
}

export interface ThongKeDonThuocDto {
  tongDonThuoc: number;
  tam: number;
  daDuyet: number;
  daXuatHet: number;
  daHuy: number;
}