import { useState } from 'react';
import type { DiagnosisItem } from '../../types/examination/diagnosis.types';

interface DiagnosisFormState {
  id?: number;
  maICD: string;
  tenChanDoan: string;
  laChanDoanChinh: boolean;
  ghiChu: string;
}

const emptyForm: DiagnosisFormState = {
  maICD: '',
  tenChanDoan: '',
  laChanDoanChinh: false,
  ghiChu: '',
};

export const useDiagnosisForm = () => {
  const [formState, setFormState] = useState<DiagnosisFormState>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  const resetForm = () => {
    setFormState(emptyForm);
    setIsEditing(false);
  };

  const startCreate = () => {
    setFormState(emptyForm);
    setIsEditing(true);
  };

  const startEdit = (diagnosis: DiagnosisItem) => {
    setFormState({
      id: diagnosis.id,
      maICD: diagnosis.maICD,
      tenChanDoan: diagnosis.tenChanDoan,
      laChanDoanChinh: diagnosis.laChanDoanChinh,
      ghiChu: diagnosis.ghiChu || '',
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const updateField = <T extends keyof DiagnosisFormState>(field: T, value: DiagnosisFormState[T]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formState,
    setFormState,
    isEditing,
    setIsEditing,
    resetForm,
    startCreate,
    startEdit,
    cancelEdit,
    updateField,
  };
};