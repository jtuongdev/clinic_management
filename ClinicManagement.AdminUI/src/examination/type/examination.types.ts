export interface CoSoDto {
  id: number;
  ma: string;
  ten: string;
}

export interface KhoaDto {
  id: number;
  ten: string;
}

export interface StatusCountDto {
  trangThai: string;
  soLuong: number;
}

export interface DepartmentCountDto {
  maKhoa: number;
  tenKhoa: string;
  soLuong: number;
}

export interface ThongKeLuotKhamDto {
  tongLuotKham: number;
  homNay: number;
  tuanNay: number;
  thangNay: number;
  theoTrangThai: StatusCountDto[];
  theoKhoa: DepartmentCountDto[];
}

export interface KpiItem {
  label: string;
  value: string;
  meta?: string;
  color: 'primary' | 'blue' | 'green' | 'orange' | 'red';
}
export interface LuotKhamDangXuLyDto {
  id: number;
  maLuotKham: string;
  tenBenhNhan: string;
  khoa: string;
  bacSi: string;
  phong: string;
  thoiGianBatDauKham: string | null;
  trangThai: string;
  soThuTu: number;
}


/// tab bệnh nhân 
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

export interface ThongKeBenhNhanDto {
  homNay: number;
  cho: number;
  dangKham: number;
  hoanThanh: number;
}

export interface PagedResultBenhNhan {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  items: BenhNhanListDto[];
}
// examination.types.ts

// --- DTO cho item danh sách lượt khám ---
export interface LuotKhamItemDto {
  id: number;
  maBenhNhanNoiBo: string;
  tenBenhNhan: string;
  tuoi: number;
  gioiTinh: string;
  tenPhongKham: string;
  hinhThucDieuTri: string;
  coBHYT: boolean;
  tenBacSi: string;
  tenKhoa: string;
  trangThai: string;
  thoiGianBatDauKham: string | null;
  soThuTu: number | null;
}

// --- Paged result cho danh sách lượt khám ---
export interface PagedResultLuotKham {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: LuotKhamItemDto[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// --- DTO thống kê khám bệnh ---
export interface ThongKeKhamBenhDto {
  cho: number;
  dangKham: number;
  choCLS: number;
  hoanThanh: number;
  daKham?: number; // nếu có
}
// DTO cho danh sách chỉ định dịch vụ
export interface ChiDinhDichVuListDto {
  id: number;
  maBenhNhanNoiBo: string;
  tenBenhNhan: string;
  loaiDichVu: string;
  tenBacSiChiDinh: string;
  tenKhoa: string;
  ngayChiDinh: string; // hoặc Date
  trangThai: string;
  maBenhNhan: number;
  maKhoa: number;
  maBacSiChiDinh: number;
  maDanhMucDichVu: number;
  tenDichVu: string;
}

export interface ThongKeChiDinhDichVuDto {
  tongChiDinh: number;
  dangXuLy: number;
  hoanThanh: number;
  tbTraKetQua: number; // trung bình trả kết quả
  batThuong: number;
  khoaYeuCau: number;
}