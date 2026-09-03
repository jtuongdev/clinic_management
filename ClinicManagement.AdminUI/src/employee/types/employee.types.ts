export interface Employee {
  id: number;
  username: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh: string;
  email: string;
  dienThoai: string;
  maChucVu?: number;
  tenChucVu?: string;
  chuyenKhoa: string;
  soHanhNghe: string;
  isActive: boolean;
  lastLogin?: string;
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
  chuyenKhoa: string;
  soHanhNghe: string;
}

export type UpdateEmployeeRequest = Omit<CreateEmployeeRequest, 'username' | 'password'>;
