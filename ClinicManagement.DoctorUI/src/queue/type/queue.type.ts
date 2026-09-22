export interface HangDoiDto {
  id: number;
  soThuTu: number | null;
  maBenhNhanNoiBo: string;
  hoTen: string;
  gioiTinh: string;
  tuoi: number;
  maLuotKham: string;
  tenKhoa: string;
  thoiGianCapNhat: string | null;
  trangThai: string; // 'CHO_KHAM' | 'DANG_KHAM' | 'CHO_CLS' | 'CO_KET_QUA_CLS' | 'HOAN_THANH' | 'DA_HUY'
  priority?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  vitals?: {
    mach?: number;
    huyetAp?: string;
    spo2?: number;
    nhietDo?: number;
    bmi?: number;
    nhipTho?: number;
  };
  hasAllergy?: boolean;
}
