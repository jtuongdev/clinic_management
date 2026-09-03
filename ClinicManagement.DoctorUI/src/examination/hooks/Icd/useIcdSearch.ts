import { useState } from 'react';
import toast from 'react-hot-toast';
import { examinationApi } from '../../api/examination.api';
import type { ICDOption } from '../../types/examination/diagnosis.types';

interface UseIcdSearchProps {
  setFormState: React.Dispatch<React.SetStateAction<any>>;
}

export const useIcdSearch = ({ setFormState }: UseIcdSearchProps) => {
  const [icdOptions, setIcdOptions] = useState<ICDOption[]>([]);
  const [icdKeyword, setIcdKeyword] = useState('');

  const searchICD = async () => {
    try {
      const response = await examinationApi.searchICD(icdKeyword.trim());
      if (response.data?.success) {
        setIcdOptions(response.data.data ?? []);
      } else {
        toast.error(response.data?.message || 'Không thể tra cứu ICD');
      }
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Không thể tra cứu ICD');
    }
  };

  const selectICD = (option: ICDOption) => {
    setFormState((prev: any) => ({
      ...prev,
      maICD: option.maICD,
      tenChanDoan: option.tenICD,
    }));
    setIcdOptions([]);
    setIcdKeyword('');
  };

  return {
    icdOptions,
    icdKeyword,
    setIcdKeyword,
    searchICD,
    selectICD,
    clearIcdOptions: () => setIcdOptions([]),
  };
};