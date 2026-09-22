export type TrangThaiHoaDonType =
  | 'CHO_THANH_TOAN'
  | 'THANH_TOAN_MOT_PHAN'
  | 'DA_THANH_TOAN'
  | 'DA_HUY';

export type PhuongThucThanhToanType =
  | 'TIEN_MAT'
  | 'CHUYEN_KHOAN'
  | 'THE'
  | 'BAO_HIEM';

export type TrangThaiCongNoType = 'DANG_NO' | 'DA_TAT_TOAN' | 'QUA_HAN';

export interface ChiTietHoaDonDto {
  id: number;
  loaiDoiTuong: 'THUOC' | 'DICH_VU' | 'VAT_TU' | string;
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
  ghiChu?: string;
}

export interface CongNoDto {
  id: number;
  maBenhNhan: number;
  maHoaDon: number;
  soTienNo: number;
  soTienDaTra: number;
  soTienConLai: number;
  trangThai: string;
  hanThanhToan?: string | null;
}

export interface HoaDonListItemDto {
  id: number;
  soHoaDon: string;
  maBenhNhanNoiBo?: string;
  tenBenhNhan?: string;
  maBenhNhan: number;
  maLuotKham: number;
  maCoSo: number;
  ngayLap: string;
  tongTien: number;
  soTienBaoHiemChiTra: number;
  daThanhToan: number;
  soTienConLai: number;
  trangThai: string;
  ghiChu?: string;
}

export interface HoaDonDetailDto {
  id: number;
  soHoaDon: string;
  maLuotKham: number;
  maBenhNhan: number;
  tenBenhNhan?: string;
  ngayLap: string;
  tongTien: number;
  soTienBaoHiemChiTra: number;
  soTienBenhNhanChiTra: number;
  daThanhToan: number;
  trangThai: string;
  ghiChu: string;
  chiTiet: ChiTietHoaDonDto[];
  phieuThus: PhieuThuDto[];
  congNo?: CongNoDto | null;
}

export interface RecordPaymentRequest {
  soTien: number;
  phuongThuc: PhuongThucThanhToanType;
  ghiChu?: string;
}

export interface ApplyInsuranceRequest {
  soTienBaoHiem: number;
}

export interface CancelInvoiceRequest {
  lyDoHuy?: string;
}

export interface GetInvoicesParams {
  facilityId?: number;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  status?: TrangThaiHoaDonType | string;
  pageIndex?: number;
  pageSize?: number;
}
