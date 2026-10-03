import { useState } from 'react';

export const useInsuranceList = () => {
  const [insuranceList, setInsuranceList] = useState([
    {
      loaiBaoHiem: 'BHYT' as any,
      tenNhaCungCap: '',
      soThe: '',
      ngayBatDau: null,
      ngayKetThuc: null,
      mucHuong: undefined as any,
    },
  ]);

  const addInsurance = () => {
    setInsuranceList((prev) => [
      ...prev,
      {
        loaiBaoHiem: 'BHYT' as any,
        tenNhaCungCap: '',
        soThe: '',
        ngayBatDau: null,
        ngayKetThuc: null,
        mucHuong: undefined as any,
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
        ngayBatDau: null,
        ngayKetThuc: null,
        mucHuong: undefined as any,
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