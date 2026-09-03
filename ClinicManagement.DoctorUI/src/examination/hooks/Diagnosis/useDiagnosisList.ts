import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { examinationApi } from '../../api/examination.api';
import type { DiagnosisItem } from '../../types/examination';

const toDiagnosisItem = (item: DiagnosisItem): DiagnosisItem => ({
  id: item.id,
  maICD: item.maICD,
  tenICD: item.tenICD || '',
  tenChanDoan: item.tenChanDoan,
  laChanDoanChinh: item.laChanDoanChinh,
  ghiChu: item.ghiChu || '',
});

export const useDiagnosisList = (luotKhamId?: number) => {
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDiagnoses = async () => {
    if (!luotKhamId) {
      setDiagnoses([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await examinationApi.getDiagnoses(luotKhamId);
      if (response.data?.success && response.data.data) {
        setDiagnoses(response.data.data.map(toDiagnosisItem));
      } else {
        toast.error(response.data?.message || 'Không thể tải danh sách chẩn đoán');
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách chẩn đoán');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, [luotKhamId]);

  return { diagnoses, setDiagnoses, fetchDiagnoses, isLoading };
};