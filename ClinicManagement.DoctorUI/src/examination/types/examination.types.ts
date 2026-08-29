export interface QueuePatient {
  id: number;
  stt: string;
  name: string;
  code: string;
  avatar: string;
  gender: string;
  age: number;
  visit: string;
  department: string;
  priority: 'urgent' | 'normal';
  time: string;
  status: 'wait' | 'exam' | 'done' | 'cancel';
  alert: boolean;
}

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
      icd: string;
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

export type ExamWorkspace = 'patient' | 'examination' | 'treatment' | 'electronic-record';

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

export type StartExamResponse = {
  id: number;
  maBenhNhan: number;
  maBacSi?: number;
  trangThai: string;
  thoiGianBatDauKham?: string;
  message: string;
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

export type ActionToolbarClickContext<T = unknown> = {
  action: ActionToolbarItem<T>;
  payload?: T;
};

export type ActionToolbarItem<T = unknown> = {
  key: string;
  label: string;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'ghost';
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  payload?: T;
  onClick?: (context: ActionToolbarClickContext<T>) => void;
};

export interface ActionToolbarProps<T = unknown> {
  actions: ActionToolbarItem<T>[];
  align?: 'left' | 'right';
  className?: string;
}

export interface ExamSidebarProps {
  patients: BenhNhanListDto[];
  selectedPatient: BenhNhanListDto | null;
  searchQueue: string;
  onSearchChange: (value: string) => void;
  onSelectPatient: (patient: BenhNhanListDto) => void;
  loading?: boolean;
}

export interface ExaminationWorkspaceProps {
  data: ExamDetail;
  luotKhamId?: number;
  onChange?: (field: string, value: unknown) => void;
  onSaveSuccess?: (result: ExaminationResultResponse) => void;
}

export interface PatientWorkspaceProps {
  data?: ExamDetail | null;
  luotKhamId?: number | null;
}

export interface TreatmentWorkspaceProps {
  data?: Partial<ExamDetail> | null;
  onSave?: () => void;
  onFinish?: () => void;
}

export interface ElectronicRecordWorkspaceProps {
  data: ExamDetail;
  onFinish: () => void;
}

export interface UseQueueResult {
  patients: BenhNhanListDto[];
  loading: boolean;
  error: string | null;
  fetchQueue: (pageIndex?: number, pageSize?: number) => Promise<void>;
}

export interface UsePatientWorkspaceOptions {
  luotKhamId?: number | null;
  fallbackData?: Partial<ThongTinBenhNhanTrongLuotKhamDto> | null;
}

export interface UseExaminationFormOptions {
  data: ExamDetail;
  luotKhamId?: number;
  onSaveSuccess?: (result: ExaminationResultResponse) => void;
}

export interface ExaminationFormState {
  sinhHieuId?: number;
  tienSuBenhId?: number;
  lyDoKham: string;
  loaiTienSu: string;
  tenTienSu: string;
  nhietDo: string;
  mach: string;
  huyetApTamThu: string;
  huyetApTamTruong: string;
  spo2: string;
  canNang: string;
  chieuCao: string;
}
