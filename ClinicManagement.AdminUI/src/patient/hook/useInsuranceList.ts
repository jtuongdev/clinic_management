import { useState } from 'react';
import dayjs from 'dayjs';

export const useInsuranceList = () => {
  const [insuranceList, setInsuranceList] = useState([
    {
      loaiBaoHiem: 'BHYT' as any,
      tenNhaCungCap: '',
      soThe: '',
      ngayBatDau: dayjs(),
      ngayKetThuc: dayjs().add(1, 'year'),
      mucHuong: 80,
    },
  ]);

  const addInsurance = () => {
    setInsuranceList((prev) => [
      ...prev,
      {
        loaiBaoHiem: 'BHYT' as any,
        tenNhaCungCap: '',
        soThe: '',
        ngayBatDau: dayjs(),
        ngayKetThuc: dayjs().add(1, 'year'),
        mucHuong: 80,
      },
    ]);
  };

  const removeInsurance = (index: number) => {
    setInsuranceList((prev) => prev.filter((_, i) => i !== index));
  };

  const resetInsuranceList = () => {
    setInsuranceList([
      {
        loaiBaoHiem: 'BHYT' as any,
        tenNhaCungCap: '',
        soThe: '',
        ngayBatDau: dayjs(),
        ngayKetThuc: dayjs().add(1, 'year'),
        mucHuong: 80,
      },
    ]);
  };

  return {
    insuranceList,
    addInsurance,
    removeInsurance,
    resetInsuranceList,
  };
};