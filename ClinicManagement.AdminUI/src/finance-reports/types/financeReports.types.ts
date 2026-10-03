export interface TongQuanDoanhThuDto {
  tongDoanhThu: number;
  doanhThuThucThu: number;
  bhytChiTra: number;
  benhNhanChiTra: number;
  chuaThanhToan: number;
  soLuongHoaDon: number;
  soHoaDonDaThanhToan: number;
  soHoaDonChuaThanhToan: number;
  giaTriTrungBinhHoaDon: number;
}

export interface CoCauDoanhThuDto {
  doanhThuThuoc: number;
  doanhThuDichVu: number;
  doanhThuVatTu: number;
  doanhThuKham: number;
  tyLeThuoc: number;
  tyLeDichVu: number;
  tyLeVatTu: number;
  tyLeKham: number;
}

export interface DoanhThuTheoKhoaDto {
  maKhoa: number;
  tenKhoa: string;
  soLuotKham: number;
  doanhThu: number;
  tyTrong: number;
}

export interface DoanhThuTheoCoSoDto {
  maCoSo: number;
  tenCoSo: string;
  soHoaDon: number;
  doanhThu: number;
  daThu: number;
  tyTrong: number;
}

export interface DoanhThuTheoThoiGianDto {
  mocThoiGian: string;
  tongDoanhThu: number;
  thucThu: number;
  bhyt: number;
  soHoaDon: number;
}

export interface TopDichVuDoanhThuDto {
  id: number;
  maDichVu: string;
  tenDichVu: string;
  loai: string;
  soLuong: number;
  doanhThu: number;
}

export interface BaoCaoDoanhThuResponseDto {
  tongQuan: TongQuanDoanhThuDto;
  coCau: CoCauDoanhThuDto;
  theoThoiGian: DoanhThuTheoThoiGianDto[];
  theoKhoa: DoanhThuTheoKhoaDto[];
  theoCoSo: DoanhThuTheoCoSoDto[];
  topDichVu: TopDichVuDoanhThuDto[];
}

// ─── CÔNG NỢ ─────────────────────────────────────────────────────────────────

export interface TongQuanCongNoDto {
  tongPhaiThuBenhNhan: number;
  phaiThuTrongHan: number;
  phaiThuQuaHan: number;
  tongPhaiTraNhaCungCap: number;
  phaiTraTrongHan: number;
  phaiTraQuaHan: number;
  chenhLechCongNo: number;
  soBenhNhanNo: number;
  soNhaCungCapNo: number;
}

export interface PhanBoTuoiNoDto {
  nhomTuoi: string;
  soTienPhaiThu: number;
  soTienPhaiTra: number;
  tyTrongPhaiThu: number;
  tyTrongPhaiTra: number;
}

export interface TopBenhNhanNoDto {
  maBenhNhan: number;
  hoTen: string;
  soDienThoai: string;
  soTienNo: number;
  soTienDaTra: number;
  soTienConLai: number;
  hanThanhToan?: string;
  soNgayQuaHan: number;
  trangThai: string;
}

export interface TopNhaCungCapNoDto {
  maNhaCungCap: number;
  maNcc: string;
  tenNhaCungCap: string;
  soDienThoai?: string;
  tongTienHang: number;
  soTienDaTra: number;
  soTienConLai: number;
  hanThanhToan: string;
  soNgayQuaHan: number;
  trangThai: string;
}

export interface BaoCaoCongNoResponseDto {
  tongQuan: TongQuanCongNoDto;
  phanBoTuoiNo: PhanBoTuoiNoDto[];
  topBenhNhanNo: TopBenhNhanNoDto[];
  topNhaCungCapNo: TopNhaCungCapNoDto[];
}

// ─── THU CHI ─────────────────────────────────────────────────────────────────

export interface TongQuanThuChiDto {
  tongThu: number;
  tongChi: number;
  dongTienRong: number;
  doanhThuThuan: number;
  giaVonHangBan: number;
  chiPhiNhanSu: number;
  loiNhuanGopUocTinh: number;
  tySuatLoiNhuanGop: number;
}

export interface PhanBoPhuongThucThuDto {
  phuongThuc: string;
  tenPhuongThuc: string;
  soTien: number;
  soGiaoDich: number;
  tyTrong: number;
}

export interface CoCauChiPhiDto {
  khoanMuc: string;
  soTien: number;
  tyTrong: number;
}

export interface ThuChiTheoThoiGianDto {
  mocThoiGian: string;
  tienThu: number;
  tienChi: number;
  dongTienRong: number;
}

export interface BaoCaoThuChiResponseDto {
  tongQuan: TongQuanThuChiDto;
  phanBoThu: PhanBoPhuongThucThuDto[];
  coCauChi: CoCauChiPhiDto[];
  theoThoiGian: ThuChiTheoThoiGianDto[];
}

export interface GetFinanceReportParams {
  facilityId?: number;
  departmentId?: number;
  fromDate?: string;
  toDate?: string;
  groupBy?: string;
}
