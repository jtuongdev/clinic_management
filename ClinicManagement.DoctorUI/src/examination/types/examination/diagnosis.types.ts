export type DiagnosisItem = {
  id?: number;
  maICD: string;
  tenICD?: string;
  tenChanDoan: string;
  laChanDoanChinh: boolean;
  ghiChu: string;
};

export type ICDOption = {
  maICD: string;
  tenICD: string;
  chuong: string;
};

export interface DiagnosisFormState {
  id?: number;
  maICD: string;
  tenChanDoan: string;
  laChanDoanChinh: boolean;
  ghiChu: string;
}