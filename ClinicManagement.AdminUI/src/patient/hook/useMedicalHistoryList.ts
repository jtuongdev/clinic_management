import { useState } from 'react';

export const useMedicalHistoryList = () => {
  const [historyList, setHistoryList] = useState([
    {
      loaiTienSu: 'BenhNen' as any,
      ten: '',
      ghiChu: '',
    },
  ]);

  const addHistory = () => {
    setHistoryList((prev) => [
      ...prev,
      {
        loaiTienSu: 'BenhNen' as any,
        ten: '',
        ghiChu: '',
      },
    ]);
  };

  const removeHistory = (index: number) => {
    setHistoryList((prev) => prev.filter((_, i) => i !== index));
  };

  const resetHistoryList = () => {
    setHistoryList([
      {
        loaiTienSu: 'BenhNen' as any,
        ten: '',
        ghiChu: '',
      },
    ]);
  };

  return {
    historyList,
    addHistory,
    removeHistory,
    resetHistoryList,
  };
};