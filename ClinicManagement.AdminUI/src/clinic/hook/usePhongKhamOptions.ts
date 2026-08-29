import { useState, useEffect } from 'react';
import { clinicApi } from '../api/axios.clinic.api';
import { PhongKhamDropdownDto } from '../type/drow.clinic.type';

export const usePhongKhamOptions = (maKhoa?: number) => {
  const [phongKhams, setPhongKhams] = useState<PhongKhamDropdownDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!maKhoa) {
      setPhongKhams([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await clinicApi.getDropdownPhongKhamByKhoa(maKhoa);
        setPhongKhams(res.data.data);
      } catch (error) {
        console.error('Load phòng khám thất bại:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [maKhoa]);

  return { phongKhams, loading };
};