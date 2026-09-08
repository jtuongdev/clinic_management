export interface ExaminationFacilityLocation {
  id: number;
  code: string;
  name: string;
}

export interface ExaminationFacilityDepartment {
  maKhoa: number;
  tenKhoa: string;
  tongLuotKham: number;
  soLuotCho: number;
  soBacSi: number;
  trangThai: string;
}

export interface ExaminationFacilityRoom {
  id: number;
  code: string;
  name: string;
  departmentName: string;
  status: string;
  waitingCount: number;
}
