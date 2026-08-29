import { useState, useEffect } from 'react';
import { khoaApi } from '../../department/api/department.api';
import { KhoaDropdownDto } from '../../department/type/department.type';

export const useKhoaOptions = (maCoSo: number) => {
  const [khoas, setKhoas] = useState<KhoaDropdownDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!maCoSo) {
      setKhoas([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await khoaApi.getDropdown(maCoSo);
        setKhoas(res.data?.data || []);
      } catch (error) {
        console.error('Load khoa thất bại:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [maCoSo]);

  return { khoas, loading };
};