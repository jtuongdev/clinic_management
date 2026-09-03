import type { ExamDetail, ExaminationResultResponse } from './exam.types';



export interface TienSuBenhForm { id?: number; loaiTienSu: string; ten: string; ghiChu?: string; }
export interface ExaminationWorkspaceProps {
  data: ExamDetail;
  luotKhamId?: number;
  onChange?: (field: string, value: unknown) => void;
  onSaveSuccess?: (result: ExaminationResultResponse) => void;
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

  // Form tiền sử đang nhập
  loaiTienSu: string;
  tenTienSu: string;
  ghiChuTienSu: string;

  // Toàn bộ tiền sử bệnh
  tienSuBenhs: TienSuBenhForm[];

  nhietDo: string;
  mach: string;
  huyetApTamThu: string;
  huyetApTamTruong: string;
  spo2: string;
  canNang: string;
  chieuCao: string;
}

