import { useState, useEffect, useCallback } from 'react';
import { detailpatientApi } from '../api/detail.patient.api';
import type { PagedResultVisits, LuotKhamItemDto } from '../type/visit.patient.type';

interface UsePatientVisitsParams {
  patientId: number;
  pageIndex?: number;
  pageSize?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export const usePatientVisits = ({
  patientId,
  pageIndex = 1,
  pageSize = 10,
  status,
  fromDate,
  toDate,
}: UsePatientVisitsParams) => {
  const [data, setData] = useState<PagedResultVisits | null>(null);
  const [items, setItems] = useState<LuotKhamItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    if (!patientId || patientId <= 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await detailpatientApi.getVisits(patientId, {
        pageIndex,
        pageSize,
        status,
        fromDate,
        toDate,
      });
      if (response.data?.data) {
        const result = response.data.data;
        setData(result);
        setItems(result.items || []);
      } else {
        setData(null);
        setItems([]);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu lượt khám');
      console.error('usePatientVisits error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, pageIndex, pageSize, status, fromDate, toDate]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return {
    data,
    items,
    loading,
    error,
    refetch: fetchVisits,
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    hasPreviousPage: data?.hasPreviousPage || false,
    hasNextPage: data?.hasNextPage || false,
  };
};