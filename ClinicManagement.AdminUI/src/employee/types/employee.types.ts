export interface Employee {
  id: number;
  username: string;
  maNhanVien?: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh: string;
  email: string;
  dienThoai: string;
  maChucVu?: number;
  tenChucVu?: string;
  maKhoa?: number;
  tenKhoa?: string;
  maPhongKham?: number;
  tenPhongKham?: string;
  chuyenKhoa: string;
  soHanhNghe: string;
  isActive: boolean;
  luongCoBan?: number;
  lastLogin?: string;
  ngayVaoLam?: string;
  trangThaiLamViec?: 'DANG_LAM' | 'TAM_HOAN' | 'NGHI_VIEC' | string;
}

export interface CreateEmployeeRequest {
  username: string;
  password: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh: string;
  email: string;
  dienThoai: string;
  maChucVu?: number;
  maKhoa?: number;
  chuyenKhoa?: string;
  soHanhNghe?: string;
}

export type UpdateEmployeeRequest = Omit<CreateEmployeeRequest, 'username' | 'password'>;

export interface ChucVuDto {
  id: number;
  tenChucVu: string;
  moTa?: string;
  thuLaoMoiLuot?: number;
}
