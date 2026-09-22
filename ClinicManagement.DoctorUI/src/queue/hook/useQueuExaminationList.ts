// hooks/useQueueExtended.ts
import { useState, useEffect, useCallback } from 'react';
import { type HangDoiDto } from '../type/queue.type';
import { useAuth } from '../../Auth/context/AuthProvider';
import {QueueApi}from '../api/axios.queue.api'

interface UseQueueExtendedOptions {
  /** Mã bác sĩ (nếu không truyền sẽ lấy từ user đăng nhập) */
  maBacSi?: number;
  /** Trang hiện tại (mặc định 1) */
  initialPage?: number;
  /** Số lượng bản ghi mỗi trang (mặc định 10) */
  initialPageSize?: number;
  /** Tự động fetch khi mount (mặc định true) */
  autoFetch?: boolean;
}

interface UseQueueExtendedResult {
  /** Danh sách hàng đợi */
  patients: HangDoiDto[];
  /** Tổng số bản ghi */
  totalCount: number;
  /** Trang hiện tại */
  pageIndex: number;
  /** Số bản ghi mỗi trang */
  pageSize: number;
  /** Đang tải */
  loading: boolean;
  /** Lỗi nếu có */
  error: string | null;
  /** Hàm tải lại dữ liệu */
  fetchQueue: (page?: number, pageSize?: number) => Promise<void>;
  /** Hàm chuyển trang */
  goToPage: (page: number) => void;
  /** Hàm thay đổi số bản ghi mỗi trang */
  setPageSize: (size: number) => void;
  /** Làm mới danh sách (giữ nguyên trang hiện tại) */
  refresh: () => Promise<void>;
}

/**
 * Hook quản lý hàng đợi khám bệnh với phân trang
 */
export function useQueueExtended(options: UseQueueExtendedOptions = {}): UseQueueExtendedResult {
  const {
    maBacSi,
    initialPage = 1,
    initialPageSize = 1000,
    autoFetch = true,
  } = options;

  const { user } = useAuth();
  const [patients, setPatients] = useState<HangDoiDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Xác định mã bác sĩ: ưu tiên tham số, nếu không có thì lấy từ user
  const bacSiId = maBacSi ?? user?.id ?? 0;

  const fetchQueue = useCallback(
    async (page?: number, size?: number) => {
      const currentPage = page ?? pageIndex;
      const currentSize = size ?? pageSize;

      if (!bacSiId || bacSiId <= 0) {
        setError('Không tìm thấy mã bác sĩ');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await QueueApi.getHangDoiExtended({
          maBacSi: bacSiId,
          pageIndex: currentPage,
          pageSize: currentSize,
        });

        const result = response.data;

        if (result.success && result.data) {
          setPatients(result.data.items || []);
          setTotalCount(result.data.totalCount || 0);
        } else {
          setError(result.message || 'Không thể tải hàng đợi');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tải hàng đợi');
      } finally {
        setLoading(false);
      }
    },
    [bacSiId, pageIndex, pageSize]
  );

  // Tự động fetch khi mount hoặc khi pageIndex/pageSize thay đổi
  useEffect(() => {
    if (autoFetch && bacSiId > 0) {
      fetchQueue();
    }
  }, [autoFetch, bacSiId, pageIndex, pageSize, fetchQueue]);

  // Chuyển trang
  const goToPage = useCallback((page: number) => {
    if (page < 1) page = 1;
    setPageIndex(page);
  }, []);

  // Thay đổi số bản ghi mỗi trang (tự động về trang 1)
  const setPageSize = useCallback((size: number) => {
    if (size < 1) size = 1000;
    if (size > 2000) size = 2000;
    setPageSizeState(size);
    setPageIndex(1);
  }, []);

  // Refresh: giữ nguyên trang hiện tại
  const refresh = useCallback(async () => {
    await fetchQueue();
  }, [fetchQueue]);

  return {
    patients,
    totalCount,
    pageIndex,
    pageSize,
    loading,
    error,
    fetchQueue,
    goToPage,
    setPageSize,
    refresh,
  };
}