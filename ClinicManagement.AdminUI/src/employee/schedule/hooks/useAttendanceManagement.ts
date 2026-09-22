import { useCallback, useEffect, useState } from 'react';
import { App } from 'antd';
import type { Dayjs } from 'dayjs';
import {
  scheduleApi,
  type Attendance,
  type AttendanceAdjustment,
  type AttendanceKpiSummary,
  type AttendancePeriod,
  type CreateLeaveRequest,
  type LeaveRequest,
  type ScheduleAdjustment,
} from '../api/schedule.api';

const dateFormat = 'YYYY-MM-DD';
const apiError = (error: unknown): string => {
  const data = (error as {
    response?: { data?: { message?: string; detail?: string; errors?: string[] } };
  })?.response?.data;
  return data?.message
    || data?.detail
    || data?.errors?.join(', ')
    || 'Thao tác lịch làm việc thất bại.';
};

interface AttendanceManagementOptions {
  weekDays: Dayjs[];
  selectedKhoa?: number;
  onReload: () => Promise<void>;
}

export const useAttendanceManagement = ({
  weekDays,
  selectedKhoa,
  onReload,
}: AttendanceManagementOptions) => {
  const { message } = App.useApp();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendanceKpi, setAttendanceKpi] = useState<AttendanceKpiSummary | null>(null);
  const [attendanceAdjustments, setAttendanceAdjustments] = useState<AttendanceAdjustment[]>([]);
  const [attendancePeriods, setAttendancePeriods] = useState<AttendancePeriod[]>([]);

  const loadAttendance = useCallback(async (): Promise<void> => {
    try {
      const range = {
        fromDate: weekDays[0].format(dateFormat),
        toDate: weekDays[6].format(dateFormat),
      };
      const [attendanceResponse, kpiResponse] = await Promise.all([
        scheduleApi.getAttendance(range),
        scheduleApi.getKpiSummary({ ...range, maKhoa: selectedKhoa }),
      ]);
      const [adjustmentResponse, periodResponse] = await Promise.all([
        scheduleApi.getAttendanceAdjustments(range),
        scheduleApi.getAttendancePeriods(),
      ]);
      setAttendance(attendanceResponse.data.data || []);
      setAttendanceKpi(kpiResponse.data.data || null);
      setAttendanceAdjustments(adjustmentResponse.data.data || []);
      setAttendancePeriods(periodResponse.data.data || []);
    } catch (error) {
      message.error(apiError(error));
    }
  }, [message, selectedKhoa, weekDays]);

  const loadAttendanceRange = useCallback(async (fromDate: Dayjs, toDate: Dayjs): Promise<void> => {
    try {
      const range = {
        fromDate: fromDate.format(dateFormat),
        toDate: toDate.format(dateFormat),
      };
      const [attendanceResponse, kpiResponse, leaveResponse, adjustmentResponse, periodResponse] = await Promise.all([
        scheduleApi.getAttendance(range),
        scheduleApi.getKpiSummary({ ...range, maKhoa: selectedKhoa }),
        scheduleApi.getLeaves({ ...range, maNhanVien: undefined }),
        scheduleApi.getAttendanceAdjustments(range),
        scheduleApi.getAttendancePeriods(),
      ]);
      setAttendance(attendanceResponse.data.data || []);
      setAttendanceKpi(kpiResponse.data.data || null);
      setLeaves(leaveResponse.data.data || []);
      setAttendanceAdjustments(adjustmentResponse.data.data || []);
      setAttendancePeriods(periodResponse.data.data || []);
    } catch (error) {
      message.error(apiError(error));
    }
  }, [message, selectedKhoa]);

  const loadLeaves = useCallback(async (): Promise<void> => {
    try {
      const response = await scheduleApi.getLeaves({
        fromDate: weekDays[0].format(dateFormat),
        toDate: weekDays[6].format(dateFormat),
        maNhanVien: undefined,
      });
      setLeaves(response.data.data || []);
    } catch (error) {
      message.error(apiError(error));
    }
  }, [message, weekDays]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const createLeave = async (data: CreateLeaveRequest): Promise<void> => {
    try {
      await scheduleApi.createLeave(data);
      message.success('Tạo đơn nghỉ phép thành công.');
      await onReload();
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const reviewLeave = async (id: number, approved: boolean, ghiChu?: string): Promise<void> => {
    try {
      await scheduleApi.reviewLeave(id, approved, ghiChu);
      message.success(approved ? 'Đã duyệt đơn nghỉ phép.' : 'Đã từ chối đơn nghỉ phép.');
      await onReload();
    } catch (error) {
      message.error(apiError(error));
    }
  };

  const cancelLeave = async (id: number): Promise<void> => {
    try {
      await scheduleApi.cancelLeave(id);
      message.success('Đã hủy đơn nghỉ phép.');
      await onReload();
    } catch (error) {
      message.error(apiError(error));
    }
  };

  const getAdjustments = async (scheduleId: number): Promise<ScheduleAdjustment[]> => {
    try {
      const response = await scheduleApi.getAdjustments(scheduleId);
      return response.data.data || [];
    } catch (error) {
      message.error(apiError(error));
      return [];
    }
  };

  const getAttendance = (scheduleId: number): Attendance | undefined =>
    attendance.find(item => item.maLichLamViec === scheduleId);

  const checkIn = async (data?: { maNhanVien?: number; thoiGianQuet?: string; ghiChu?: string } | number): Promise<Attendance | undefined> => {
    try {
      const response = await scheduleApi.checkIn(data);
      const resData = response.data.data;
      const shiftDesc = resData?.tenCa ? ` vào ${resData.tenCa}` : '';
      message.success(`Check-in${shiftDesc} thành công.`);
      await onReload();
      return resData;
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const checkOut = async (data?: { maNhanVien?: number; thoiGianQuet?: string; ghiChu?: string } | number): Promise<Attendance | undefined> => {
    try {
      const response = await scheduleApi.checkOut(data);
      const resData = response.data.data;
      const shiftDesc = resData?.tenCa ? ` từ ${resData.tenCa}` : '';
      message.success(`Check-out${shiftDesc} thành công.`);
      await onReload();
      return resData;
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const finalizeAbsent = async (): Promise<void> => {
    try {
      const response = await scheduleApi.finalizeAbsent();
      message.success(`Đã chốt ${response.data.data || 0} ca vắng mặt.`);
      await onReload();
    } catch (error) {
      message.error(apiError(error));
    }
  };

  const requestAttendanceAdjustment = async (data: Parameters<typeof scheduleApi.requestAttendanceAdjustment>[0]): Promise<void> => {
    try {
      await scheduleApi.requestAttendanceAdjustment(data);
      message.success('Đã gửi yêu cầu điều chỉnh chấm công.');
      await onReload();
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const reviewAttendanceAdjustment = async (id: number, approved: boolean, ghiChu?: string): Promise<void> => {
    try {
      if (approved) await scheduleApi.approveAttendanceAdjustment(id, ghiChu);
      else await scheduleApi.rejectAttendanceAdjustment(id, ghiChu);
      message.success(approved ? 'Đã duyệt điều chỉnh chấm công.' : 'Đã từ chối điều chỉnh chấm công.');
      await onReload();
    } catch (error) {
      message.error(apiError(error));
    }
  };

  const createAttendancePeriod = async (data: Parameters<typeof scheduleApi.createAttendancePeriod>[0]): Promise<void> => {
    try {
      await scheduleApi.createAttendancePeriod(data);
      message.success('Đã tạo kỳ chấm công.');
      const response = await scheduleApi.getAttendancePeriods();
      setAttendancePeriods(response.data.data || []);
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const toggleAttendancePeriod = async (period: AttendancePeriod): Promise<void> => {
    try {
      if (period.daKhoa) await scheduleApi.unlockAttendancePeriod(period.id);
      else await scheduleApi.lockAttendancePeriod(period.id);
      message.success(period.daKhoa ? 'Đã mở khóa kỳ chấm công.' : 'Đã khóa kỳ chấm công.');
      const response = await scheduleApi.getAttendancePeriods();
      setAttendancePeriods(response.data.data || []);
    } catch (error) {
      message.error(apiError(error));
    }
  };

  return {
    attendance,
    attendanceKpi,
    attendanceAdjustments,
    attendancePeriods,
    leaves,
    loadAttendance,
    loadAttendanceRange,
    loadLeaves,
    createLeave,
    reviewLeave,
    cancelLeave,
    getAdjustments,
    getAttendance,
    checkIn,
    checkOut,
    finalizeAbsent,
    requestAttendanceAdjustment,
    reviewAttendanceAdjustment,
    createAttendancePeriod,
    toggleAttendancePeriod,
  };
};
