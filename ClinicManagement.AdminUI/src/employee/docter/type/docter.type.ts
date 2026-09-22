export interface PhongKhamOption {
  id: number;
  ma: string;
  ten: string;
  maKhoa: number;
  trangThai: string;
}

export interface BacSiDto {
  id: number;
  maNhanVien?: string;
  hoTen: string;
  chuyenKhoa?: string;
  soHanhNghe?: string;
  email?: string;
  dienThoai?: string;
  dangTruc?: boolean;
  maPhongKhamMacDinh?: number | null;
  tenPhongKhamMacDinh?: string | null;
  danhSachPhongKham?: PhongKhamOption[];
  phongKhams?: PhongKhamOption[];
}

export interface BacSiTrucDto {
  id: number;
  hoTen: string;
  khoa: string;
  phong: string;
  trangThai: string; 
  soLuongCho: number;
}