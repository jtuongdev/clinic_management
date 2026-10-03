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
  soTheBHYT?: string;
  tenNhaCungCapBHYT?: string;
  mucHuongBHYT?: number;
  ngayBatDauBHYT?: string;
  ngayKetThucBHYT?: string;
  bhytConHan?: boolean;
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
  soTheBHYT?: string;
  tenNhaCungCapBHYT?: string;
  mucHuongBHYT?: number;
  ngayBatDauBHYT?: string;
  ngayKetThucBHYT?: string;
  bhytConHan?: boolean;
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

export interface LichSuThanhToanNhaCungCapDto {
  lan: number;
  soTien: number;
  ngayThanhToan: string;
  phuongThuc: string;
  ghiChu?: string;
}

export interface CongNoNhaCungCapDto {
  id: number;
  maPhieuNhap: string;
  maNhaCungCap: number;
  maNcc: string;
  tenNhaCungCap: string;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  maCoSo: number;
  maKho: number;
  ngayNhap: string;
  hanThanhToan: string;
  tongTien: number;
  soTienDaTra: number;
  soTienConLai: number;
  trangThai: 'DANG_NO' | 'QUA_HAN' | 'DA_TAT_TOAN' | string;
  trangThaiTen: string;
  soNgayQuaHan: number;
  ghiChu?: string;
  lichSuThanhToan: LichSuThanhToanNhaCungCapDto[];
}

export interface TongQuanCongNoNhaCungCapDto {
  tongCongNo: number;
  tongNoQuaHan: number;
  tongDaThanhToan: number;
  soPhieuChuaThanhToan: number;
  soPhieuQuaHan: number;
  soNhaCungCapConNo: number;
  tongSoPhieu: number;
}

export interface DanhSachCongNoNhaCungCapResponseDto {
  danhSach: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    items: CongNoNhaCungCapDto[];
  };
  tongQuan: TongQuanCongNoNhaCungCapDto;
}

export interface ThanhToanCongNoNhaCungCapRequest {
  maPhieuNhap: number;
  soTienThanhToan: number;
  phuongThucThanhToan: string;
  ghiChu?: string;
}

export interface GetSupplierDebtsParams {
  facilityId?: number;
  supplierId?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface CongNoBenhNhanChiTietDto {
  id: number;
  maBenhNhan: number;
  tenBenhNhan: string;
  soDienThoai: string;
  soCCCD: string;
  maHoaDon: number;
  soHoaDon: string;
  ngayLapHoaDon: string;
  maCoSo: number;
  tongTienHoaDon: number;
  soTienNo: number;
  soTienDaTra: number;
  soTienConLai: number;
  hanThanhToan?: string | null;
  trangThai: string;
  trangThaiTen: string;
  soNgayQuaHan: number;
}

export interface TongQuanCongNoBenhNhanDto {
  tongCongNo: number;
  tongNoQuaHan: number;
  tongDaThanhToan: number;
  soKhoanNo: number;
  soKhoanQuaHan: number;
  soBenhNhanConNo: number;
  tongSoKhoan: number;
}

export interface DanhSachCongNoBenhNhanResponseDto {
  danhSach: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    items: CongNoBenhNhanChiTietDto[];
  };
  tongQuan: TongQuanCongNoBenhNhanDto;
}

export interface GetPatientDebtsParams {
  facilityId?: number;
  status?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
}
