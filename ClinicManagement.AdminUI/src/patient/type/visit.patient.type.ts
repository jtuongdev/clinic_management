

export interface ChanDoanVisitDto {
  id: number;
  maICD: string;
  tenICD: string;
  tenChanDoan: string;
  laChanDoanChinh: boolean;
  ghiChu: string;
}

export interface SinhHieuVisitDto {
  huyetApTamThu: number | null;
  huyetApTamTruong: number | null;
  mach: number | null;
  nhietDo: number | null;
  canNang: number | null;
  chieuCao: number | null;
  spO2: number | null;
  thoiDiemDo: string;
}

export interface ChiTietKetQuaXetNghiemVisitDto {
  tenChiSo: string;
  giaTri: string;
  donVi: string;
  khoangThamChieu: string;
  batThuong: boolean | null;
}

export interface ChiDinhDichVuVisitDto {
  id: number;
  tenDichVu: string;
  loaiDichVu: string;
  trangThai: string;
  ngayChiDinh: string;
  ngayThucHien: string | null;
  ngayCoKetQua: string | null;
  ketLuan: string;
  urlKetQua: string;
  ketQuaChiTiet: ChiTietKetQuaXetNghiemVisitDto[];
}

export interface ChiTietDonThuocVisitDto {
  tenThuoc: string;
  donViTinh: string;
  soLuongKe: number;
  soLuongDaXuat: number;
  lieuDung: string;
  tanSuat: string;
  soNgay: number | null;
  huongDan: string;
  donGia: number;
}

export interface DonThuocVisitDto {
  id: number;
  ngayKe: string;
  trangThai: string;
  ghiChu: string;
  chiTiet: ChiTietDonThuocVisitDto[];
}

export interface LuotKhamItemDto {
  id: number;
  ngayKham: string;
  trangThai: string;
  hinhThucDieuTri: string;
  lyDoKham: string;
  phongKham: string;
  thoiGianBatDauKham: string | null;
  thoiGianKetThucKham: string | null;
  bacSi: string;
  chuyenKhoaBacSi: string;
  khoa: string;
  chanDoans: ChanDoanVisitDto[];
  sinhHieu: SinhHieuVisitDto | null;
  chiDinhDichVus: ChiDinhDichVuVisitDto[];
  donThuocs: DonThuocVisitDto[];
}

export interface PagedResultVisits {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: LuotKhamItemDto[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}