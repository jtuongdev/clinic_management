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

export interface ExamSidebarProps {
  patients: BenhNhanListDto[];
  selectedPatient: BenhNhanListDto | null;
  searchQueue: string;
  onSearchChange: (value: string) => void;
  onSelectPatient: (patient: BenhNhanListDto) => void;
  loading?: boolean;
}

export interface UseQueueResult {
  patients: BenhNhanListDto[];
  loading: boolean;
  error: string | null;
  fetchQueue: (pageIndex?: number, pageSize?: number) => Promise<void>;
}