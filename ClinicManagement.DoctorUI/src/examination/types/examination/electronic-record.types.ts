import type { ExamDetail } from './exam.types';

export interface ElectronicRecordWorkspaceProps {
  data: ExamDetail;
  onFinish: () => void;
}