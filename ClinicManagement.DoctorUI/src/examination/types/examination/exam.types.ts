

export type ExamWorkspace = 'patient' | 'examination' | 'treatment' | 'electronic-record';

export interface ExamDetail {
  visit: string;
  department: string;
  room: string;
  status: string;
  patient: {
    name: string;
    code: string;
    dob: string;
    gender: string;
    cccd: string;
    bhyt: string;
    phone: string;
    address: string;
  };
  examination: {
    reason: string;
    history: string;
    vitals: {
      id?: number;
      temperature: string;
      pulse: string;
      bloodPressure: string;
      respiration: string;
      spo2: string;
      canNang?: string;
      chieuCao?: string;
    };
    tienSuBenh?: {
      id?: number;
      loaiTienSu: string;
      ten: string;
      ghiChu?: string;
    };
    symptoms: string;
    initialAssessment: string;
  };
  treatment: {
    diagnosis: {
      icd: string;
      name: string;
      diagnosis: string;
      type: string;
      note: string;
      assessment: string;
    };
    diagnosisList: Array<{
      id?: number;
      icd: string;
      tenICD?: string;
      name: string;
      type: string;
      note: string;
    }>;
    services: Array<{
      name: string;
      qty: number;
      status: string;
      time: string;
    }>;
    drugs: Array<{
      name: string;
      qty: number;
      unit: string;
      dose: string;
      freq: string;
      days: number;
      route: string;
    }>;
    results: Array<{
      indicator: string;
      result: string;
      unit: string;
      ref: string;
      evaluation: string;
    }>;
  };
}

export interface ThongTinBenhNhanTrongLuotKhamDto {
  luotKhamId: number;
  maLuotKham: string;
  khoa: string;
  phong: string;
  trangThai: string;
  hoTen: string;
  maBenhNhanNoiBo: string;
  ngaySinh: string;
  gioiTinh: string;
  soCCCD: string;
  bhyt: string;
  diaChi: string;
  dienThoai: string;
}

export type TreatmentSummaryDto = {
  luotKhamId: number;
  maLuotKham: string;
  khoa: string;
  phong: string;
  trangThai: string;
  ngayKham: string;
  soThuTu?: number | null;
};

export type StartExamResponse = {
  id: number;
  maBenhNhan: number;
  maBacSi?: number;
  trangThai: string;
  thoiGianBatDauKham?: string;
  message: string;
};

export type ServiceOrderDto = {
  id: number;
  tenDichVu: string;
  loaiDichVu: string;
  trangThai: string;
  ngayChiDinh: string;
  ngayThucHien?: string | null;
  ngayCoKetQua?: string | null;
  ketLuan?: string | null;
  urlKetQua?: string | null;
};

export type ServiceCatalogOption = {
  id: number;
  ma: string;
  ten: string;
  loaiDichVu: string;
  donViTinh?: string;
  gia?: number;
};

export type ServiceOrderRequest = {
  maDanhMuc: number;
  maBacSiChiDinh: number;
  maNguoiThucHien?: number | null;
  trangThai?: string;
  ketLuan?: string | null;
  urlKetQua?: string | null;
  ngayChiDinh?: string;
  ngayThucHien?: string | null;
  ngayCoKetQua?: string | null;
};

export type SaveExaminationRequest = {
  lyDoKham: string;
  ghiChuTienSu?: string;
  tienSuBenhs?: Array<{
    id?: number;
    loaiTienSu: string;
    ten: string;
    ghiChu?: string;
  }>;
  sinhHieu?: {
    id?: number;
    nhietDo?: number | null;
    mach?: number | null;
    huyetApTamThu?: number | null;
    huyetApTamTruong?: number | null;
    spO2?: number | null;
    canNang?: number | null;
    chieuCao?: number | null;
  };
};
export type ExaminationDetailResponse = {
  lyDoKham: string;
  ghiChuTienSu?: string;
  tienSuBenhs?: Array<{
    id?: number;
    loaiTienSu: number; // 1, 2, ...
    ten: string;
    ghiChu?: string;
  }>;
  sinhHieu?: {
    id?: number;
    nhietDo?: number | null;
    mach?: number | null;
    huyetApTamThu?: number | null;
    huyetApTamTruong?: number | null;
    spO2?: number | null;
    canNang?: number | null;
    chieuCao?: number | null;
  };
};

export type LoaiTienSuOption = {
  value: string;
  label: string;
  description: string;
};

export type ExaminationResultResponse = {
  id: number;
  maBenhNhan: number;
  tenBenhNhan: string;
  maBenhNhanNoiBo: string;
  maBacSi?: number;
  tenBacSi: string;
  khoa: string;
  phong: string;
  trangThai: string;
  ngayKham: string;
  thoiGianBatDauKham?: string;
  lyDoKham: string;
  ghiChuTienSu?: string;
  sinhHieu?: {
    id: number;
    nhietDo?: number;
    mach?: number;
    huyetApTamThu?: number;
    huyetApTamTruong?: number;
    spO2?: number;
    canNang?: number;
    chieuCao?: number;
    thoiDiemDo: string;
  };
  tienSuBenhs?: Array<{
    id: number;
    loaiTienSu: string;
    ten: string;
    ghiChu: string;
  }>;
};
// types/examination/index.ts
export interface TienSuBenhDto {
  id?: number;
  loaiTienSu: number;
  ten: string;
  ghiChu?: string;
}