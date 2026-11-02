import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { examinationApi } from '../../api/examination.api';
import type { ICDOption } from '../../types/examination/diagnosis.types';

interface UseIcdSearchProps {
  setFormState: React.Dispatch<React.SetStateAction<any>>;
}

export const useIcdSearch = ({ setFormState }: UseIcdSearchProps) => {
  const [icdOptions, setIcdOptions] = useState<ICDOption[]>([]);
  const [icdKeyword, setIcdKeyword] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchICD = useCallback(async (kw?: string) => {
    const keyword = (kw ?? icdKeyword).trim();
    if (!keyword) {
      setIcdOptions([]);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    try {
      const response = await examinationApi.searchICD(keyword);
      if (response.data?.success) {
        const items = response.data.data ?? [];
        setIcdOptions(items);
        setSelectedIndex(items.length > 0 ? 0 : -1);
      } else {
        toast.error(response.data?.message || 'Không thể tra cứu ICD');
      }
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Không thể tra cứu ICD');
    } finally {
      setIsSearching(false);
    }
  }, [icdKeyword]);

  // Tự động tìm kiếm với Debounce 300ms khi gõ từ khóa
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (icdKeyword.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        void searchICD(icdKeyword);
      }, 300);
    } else {
      setIcdOptions([]);
      setSelectedIndex(-1);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [icdKeyword, searchICD]);

  const selectICD = (option: ICDOption) => {
    setFormState((prev: any) => ({
      ...prev,
      maICD: option.maICD,
      tenChanDoan: option.tenICD,
    }));
    setIcdOptions([]);
    setIcdKeyword('');
    setSelectedIndex(-1);
  };

  // Hỗ trợ phím tắt: Mũi tên lên/xuống và Enter để chọn
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (icdOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < icdOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : icdOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < icdOptions.length) {
        selectICD(icdOptions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIcdOptions([]);
      setSelectedIndex(-1);
    }
  };

  return {
    icdOptions,
    icdKeyword,
    selectedIndex,
    isSearching,
    setIcdKeyword,
    searchICD,
    selectICD,
    handleKeyDown,
    clearIcdOptions: () => {
      setIcdOptions([]);
      setSelectedIndex(-1);
    },
  };
};