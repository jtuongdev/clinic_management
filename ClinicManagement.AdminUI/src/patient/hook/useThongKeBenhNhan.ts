// SỬA: import { patientApi } thay vì { apiThongKeBenhNhan }
import { patientApi } from '../api/patient.api'; 
import { useState, useEffect } from 'react';

export const useThongKeBenhNhan = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await patientApi.getThongKe(); 
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
};