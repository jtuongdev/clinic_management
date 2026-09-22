import { useState, useEffect } from 'react';
import { BacSiApi } from '../api/docter.api';
import { BacSiDto } from '../type/docter.type';

export const useBacSiOptions = (maKhoa?: number, maCoSo?: number) => {
  const [bacSis, setBacSis] = useState<BacSiDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!maKhoa || maKhoa <= 0) {
      setBacSis([]);
      return;
    }

    let isMounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await BacSiApi.getBacSiByKhoa(maKhoa, maCoSo);
        if (isMounted) {
          setBacSis(res.data?.data || []);
        }
      } catch (error) {
        console.error('Load bác sĩ thất bại:', error);
        if (isMounted) {
          setBacSis([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, [maKhoa, maCoSo]);

  return { bacSis, loading };
};