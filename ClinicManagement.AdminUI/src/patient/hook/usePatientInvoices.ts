import { useState, useEffect, useCallback } from 'react';
import { detailpatientApi } from '../api/detail.patient.api';
import type { PagedResultInvoices, HoaDonItemDto } from '../type/invoice.patient.type';

interface UsePatientInvoicesParams {
  patientId: number;
  pageIndex?: number;
  pageSize?: number;
  status?: string;
}

export const usePatientInvoices = ({
  patientId,
  pageIndex = 1,
  pageSize = 10,
  status,
}: UsePatientInvoicesParams) => {
  const [data, setData] = useState<PagedResultInvoices | null>(null);
  const [items, setItems] = useState<HoaDonItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!patientId || patientId <= 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await detailpatientApi.getInvoices(patientId, {
        pageIndex,
        pageSize,
        status,
      });

      if (response.data?.data) {
        setData(response.data.data);
        setItems(response.data.data.items || []);
      } else {
        setData(null);
        setItems([]);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu hóa đơn');
      console.error('usePatientInvoices error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, pageIndex, pageSize, status]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    data,
    items,
    loading,
    error,
    refetch: fetchInvoices,
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    hasPreviousPage: data?.hasPreviousPage || false,
    hasNextPage: data?.hasNextPage || false,
  };
};