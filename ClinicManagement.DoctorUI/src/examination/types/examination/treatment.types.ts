import type { ExamDetail } from './exam.types';

export interface TreatmentWorkspaceProps {
  data?: Partial<ExamDetail> | null;
  luotKhamId?: number;
  onSave?: () => void;
  onFinish?: () => void;
}

export interface PatientWorkspaceProps {
  data?: ExamDetail | null;
  luotKhamId?: number | null;
}