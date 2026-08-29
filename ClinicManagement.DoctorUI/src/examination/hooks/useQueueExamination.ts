// src/hooks/useQueue.ts
import { useState, useEffect, useCallback } from 'react';
import { examinationApi } from '../api/examination.api';
import type { BenhNhanListDto, UseQueueResult } from '../types/examination.types';
import { useAuth } from '../../Auth/context/AuthProvider';

export function useQueue(initialPageIndex: number = 1, initialPageSize: number = 1000): UseQueueResult {
  const { user } = useAuth();
  const [patients, setPatients] = useState<BenhNhanListDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(
    async (pageIndex: number = initialPageIndex, pageSize: number = initialPageSize) => {
      if (!user?.id) {
        setError('Không tìm thấy mã bác sĩ');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await examinationApi.getHangDoi({
          maBacSi: user.id,
          pageIndex,
          pageSize,
        });

        const result = response.data;

        if (result.success && result.data) {
          setPatients(result.data.items || []);
        } else {
          setError(result.message || 'Không thể lấy dữ liệu hàng đợi');
        }
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi lấy hàng đợi');
      } finally {
        setLoading(false);
      }
    },
    [user?.id, initialPageIndex, initialPageSize]
  );

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return { patients, loading, error, fetchQueue };
}