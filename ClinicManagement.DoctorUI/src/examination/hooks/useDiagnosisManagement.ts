import { useState } from 'react';
import { useDiagnosisList } from './Diagnosis/useDiagnosisList';
import { useDiagnosisForm } from './Diagnosis/useDiagnosisForm';
import { useIcdSearch } from './Icd/useIcdSearch';
import { useDiagnosisMutations } from './Diagnosis/useDiagnosisMutations';
import type { ExamDetail } from '../types/examination/exam.types';

interface UseDiagnosisManagementOptions {
  data?: Partial<ExamDetail> | null;
  luotKhamId?: number;
}

export const useDiagnosisManagement = ({ luotKhamId }: UseDiagnosisManagementOptions) => {
  // 1. Danh sách
  const { diagnoses, fetchDiagnoses, isLoading: isLoadingList } = useDiagnosisList(luotKhamId);

  // 2. Form
  const {
    formState,
    setFormState,
    isEditing,
    resetForm,
    startCreate,
    startEdit,
    cancelEdit,
    updateField,
  } = useDiagnosisForm();

  // 3. ICD Search
  const {
    icdOptions,
    icdKeyword,
    setIcdKeyword,
    searchICD,
    selectICD,
  } = useIcdSearch({ setFormState });

  // 4. Loading state cho mutations
  const [isLoadingMutations, setIsLoadingMutations] = useState(false);

  // 5. Mutations
  const { saveDiagnosis, deleteDiagnosis } = useDiagnosisMutations({
    luotKhamId,
    formState,
    diagnoses,
    fetchDiagnoses,
    resetForm,
    setIsLoading: setIsLoadingMutations,
  });

  // Gộp loading
  const isLoading = isLoadingList || isLoadingMutations;

  return {
    diagnoses,
    formState,
    icdOptions,
    icdKeyword,
    isEditing,
    isLoading,
    setIcdKeyword,
    updateField,
    startCreate,
    startEdit,
    cancelEdit,
    searchICD,
    selectICD,
    saveDiagnosis,
    deleteDiagnosis,
  };
};