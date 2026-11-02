import { useState, useEffect } from 'react';
import { type BenhNhanProfileDto } from '../type/profile.patient.type';
import { detailpatientApi } from '../api/detail.patient.api';

export const usePatientProfile = (patientId: number) => {
  const [profile, setProfile] = useState<BenhNhanProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await detailpatientApi.getProfile(patientId);
        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          setError(response.data.message || 'Không thể tải dữ liệu');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối server');
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId > 0) {
      fetchProfile();
    }
  }, [patientId]);

  return { profile, loading, error };
};