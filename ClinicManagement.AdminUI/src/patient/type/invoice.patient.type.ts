

export interface ChiTietHoaDonDto {
  id: number;
  loaiDoiTuong: string;
  moTa: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

export interface PhieuThuDto {
  id: number;
  soPhieuThu: string;
  soTien: number;
  ngayThu: string;
  phuongThuc: string;
  nguoiThu: string;
  ghiChu: string;
}

export interface CongNoDto {
  soTienNo: number;
  soTienDaTra: number;
  soTienConLai: number;
  trangThai: string;
  hanThanhToan: string | null;
}

export interface HoaDonItemDto {
  id: number;
  soHoaDon: string;
  ngayLap: string;
  tongTien: number;
  soTienBaoHiemChiTra: number;
  soTienBenhNhanChiTra: number;
  daThanhToan: number;
  trangThai: string;
  ghiChu: string;
  chiTiet: ChiTietHoaDonDto[];
  phieuThus: PhieuThuDto[];
  congNo: CongNoDto | null;
}

export interface PagedResultInvoices {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: HoaDonItemDto[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}