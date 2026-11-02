import toast from 'react-hot-toast';
import { examinationApi } from '../../api/examination.api';
import type { DiagnosisItem, DiagnosisFormState } from '../../types/examination/diagnosis.types';

interface UseDiagnosisMutationsProps {
  luotKhamId?: number;
  formState: DiagnosisFormState;
  diagnoses: DiagnosisItem[];
  fetchDiagnoses: () => Promise<void>;
  resetForm: () => void;
  setIsLoading: (value: boolean) => void;
}

export const useDiagnosisMutations = ({
  luotKhamId,
  formState,
  diagnoses,
  fetchDiagnoses,
  resetForm,
  setIsLoading,
}: UseDiagnosisMutationsProps) => {
  const saveDiagnosis = async () => {
    if (!luotKhamId || luotKhamId <= 0) {
      toast.error('Không tìm thấy lượt khám.');
      return;
    }
    if (!formState.maICD.trim() || !formState.tenChanDoan.trim()) {
      toast.error('Vui lòng nhập mã ICD và tên chẩn đoán.');
      return;
    }
    // Kiểm tra chẩn đoán chính trùng
    if (formState.laChanDoanChinh && diagnoses.some((item) => item.laChanDoanChinh && item.id !== formState.id)) {
      toast.error('Lượt khám chỉ được có một chẩn đoán chính.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        maICD: formState.maICD.trim(),
        tenChanDoan: formState.tenChanDoan.trim(),
        laChanDoanChinh: formState.laChanDoanChinh,
        ghiChu: formState.ghiChu.trim(),
      };

      let response;
      if (formState.id) {
        response = await examinationApi.updateDiagnosis(luotKhamId, formState.id, { id: formState.id, ...payload });
      } else {
        response = await examinationApi.createDiagnosis(luotKhamId, payload);
      }

      if (!response.data?.success || !response.data.data) {
        toast.error(response.data?.message || 'Không thể lưu chẩn đoán');
        return;
      }

      await fetchDiagnoses();
      resetForm();
      toast.success(formState.id ? 'Cập nhật chẩn đoán thành công.' : 'Thêm chẩn đoán thành công.');
    } catch (requestError: any) {
      const message = requestError?.response?.data?.message || requestError.message || 'Không thể lưu chẩn đoán';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiagnosis = async (diagnosisId?: number) => {
    if (!luotKhamId || !diagnosisId) {
      toast.error('Không xác định được chẩn đoán cần xóa.');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa chẩn đoán này?')) return;

    setIsLoading(true);
    try {
      const response = await examinationApi.deleteDiagnosis(luotKhamId, diagnosisId);
      if (!response.data?.success) {
        toast.error(response.data?.message || 'Không thể xóa chẩn đoán');
        return;
      }
      await fetchDiagnoses();
      if (formState.id === diagnosisId) resetForm();
      toast.success('Xóa chẩn đoán thành công.');
    } catch (requestError: any) {
      const message = requestError?.response?.data?.message || requestError.message || 'Không thể xóa chẩn đoán';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { saveDiagnosis, deleteDiagnosis };
};