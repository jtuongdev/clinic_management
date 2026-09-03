import type { ThongTinBenhNhanTrongLuotKhamDto } from './exam.types';

export interface UsePatientWorkspaceOptions {
  luotKhamId?: number | null;
  fallbackData?: Partial<ThongTinBenhNhanTrongLuotKhamDto> | null;
}