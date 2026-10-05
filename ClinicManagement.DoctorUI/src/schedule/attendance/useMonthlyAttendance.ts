import { useCallback, useEffect, useRef, useState } from 'react';
import {
  doctorScheduleApi,
  type AttendanceItemDto,
  type ScheduleItemDto,
} from '../api/doctorSchedule.api';
import { buildMonthGrid, monthKeyOf, parseMonthParam, type MonthRef } from './attendanceCalendar.utils';

export interface MonthData {
  schedules: ScheduleItemDto[];
  attendances: AttendanceItemDto[];
}

const unwrapList = <T,>(res: unknown): T[] => {
  const body = res as { data?: unknown } | unknown[] | null | undefined;
  if (Array.isArray(body)) return body as T[];
  if (body && Array.isArray((body as { data?: unknown }).data)) return (body as { data: T[] }).data;
  return [];
};

/**
 * Loads schedules + attendances for the visible calendar grid of a month.
 * Results are cached per month; `refreshSignal` changes trigger a silent refetch.
 */
export const useMonthlyAttendance = (month: MonthRef, refreshSignal: number) => {
  const key = monthKeyOf(month);
  const cacheRef = useRef(new Map<string, MonthData>());
  const requestIdRef = useRef(0);
  const lastSignalRef = useRef(refreshSignal);

  const [data, setData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonth = useCallback(
    async (silent: boolean) => {
      const target = parseMonthParam(key);
      if (!target) return;
      const requestId = ++requestIdRef.current;
      const { fromKey, toKey } = buildMonthGrid(target);
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [schedRes, attRes] = await Promise.all([
          doctorScheduleApi.getMySchedule(fromKey, toKey),
          doctorScheduleApi.getMyAttendance(fromKey, toKey),
        ]);
        const next: MonthData = {
          schedules: unwrapList<ScheduleItemDto>(schedRes),
          attendances: unwrapList<AttendanceItemDto>(attRes),
        };
        cacheRef.current.set(key, next);
        if (requestId === requestIdRef.current) setData(next);
      } catch (err) {
        console.error('Lỗi tải lịch chấm công theo tháng:', err);
        if (requestId === requestIdRef.current) setError('Không thể tải dữ liệu chấm công của tháng này.');
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [key],
  );

  // Switch month: show cached data immediately, otherwise fetch.
  useEffect(() => {
    const cached = cacheRef.current.get(key);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
    } else {
      setData(null);
      void fetchMonth(false);
    }
  }, [key, fetchMonth]);

  // Parent signalled new data (check-in/out, periodic refresh): invalidate and refetch silently.
  useEffect(() => {
    if (lastSignalRef.current === refreshSignal) return;
    lastSignalRef.current = refreshSignal;
    cacheRef.current.clear();
    void fetchMonth(true);
  }, [refreshSignal, fetchMonth]);

  const reload = useCallback(() => {
    cacheRef.current.delete(key);
    void fetchMonth(false);
  }, [key, fetchMonth]);

  return { data, loading, error, reload };
};
