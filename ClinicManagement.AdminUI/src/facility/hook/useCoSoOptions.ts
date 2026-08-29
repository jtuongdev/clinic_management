import { useState, useEffect } from 'react';
import { coSoApi } from '../../facility/api/facility.api';
import { CoSoDropdownDto } from '../../facility/type/facility.type';

export const useCoSoOptions = (defaultCoSoId: number) => {
  const [coSos, setCoSos] = useState<CoSoDropdownDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await coSoApi.getDropdown();
        setCoSos(res.data?.data || []); 
      } catch (error) {
        console.error('Load cơ sở thất bại:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { coSos, loading };
};