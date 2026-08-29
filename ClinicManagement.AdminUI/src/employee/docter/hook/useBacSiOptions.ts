import { useState, useEffect } from 'react';
import { BacSiApi } from '../api/docter.api';
import { BacSiDto } from '../type/docter.type';

export const useBacSiOptions = (maKhoa: number) => {
  const [bacSis, setBacSis] = useState<BacSiDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!maKhoa) {
      setBacSis([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await BacSiApi.getBacSiByKhoa(maKhoa);
        setBacSis(res.data?.data || []);
      } catch (error) {
        console.error('Load bác sĩ thất bại:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [maKhoa]);

  return { bacSis, loading };
};