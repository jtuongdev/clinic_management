import { useCallback, useRef } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import type { Attendance } from '../api/schedule.api';
import type { Schedule } from '../types/schedule.types';
import { useAttendanceManagement } from './useAttendanceManagement';
import { useFixedScheduleManagement } from './useFixedScheduleManagement';
import { useScheduleData } from './useScheduleData';

export const useScheduleManagement = () => {
  const scheduleData = useScheduleData();
  const attendanceRef = useRef<ReturnType<typeof useAttendanceManagement> | null>(null);

  const loadSchedules = useCallback(async (): Promise<void> => {
    await scheduleData.loadSchedules();
    await attendanceRef.current?.loadAttendance();
    await attendanceRef.current?.loadLeaves();
  }, [scheduleData.loadSchedules]);

  const loadSchedulesRange = useCallback(async (fromDate: Dayjs, toDate: Dayjs): Promise<void> => {
    await scheduleData.loadSchedulesRange(fromDate, toDate);
    await attendanceRef.current?.loadAttendanceRange(fromDate, toDate);
  }, [scheduleData.loadSchedulesRange]);

  const attendance = useAttendanceManagement({
    weekDays: scheduleData.weekDays,
    selectedKhoa: scheduleData.selectedKhoa,
    onReload: loadSchedules,
  });
  attendanceRef.current = attendance;

  const fixed = useFixedScheduleManagement({
    selectedKhoa: scheduleData.selectedKhoa,
    onReload: loadSchedules,
  });

  const getSchedules = (shiftId: number, date: Dayjs): Schedule[] => scheduleData.schedules.filter(
    (schedule) => Number(schedule.maCaTruc) === Number(shiftId)
      && dayjs(schedule.ngayLam).isSame(date, 'day'),
  );

  return {
    activeCell: scheduleData.activeCell,
    coSos: scheduleData.coSos,
    employees: scheduleData.employees,
    editing: scheduleData.editing,
    schedules: scheduleData.schedules,
    getSchedules,
    khoas: scheduleData.khoas,
    loadSchedules,
    loadSchedulesRange,
    loading: scheduleData.loading,
    closeEditor: scheduleData.closeEditor,
    note: scheduleData.note,
    roomId: scheduleData.roomId,
    setRoomId: scheduleData.setRoomId,
    dailyStatus: scheduleData.dailyStatus,
    setDailyStatus: scheduleData.setDailyStatus,
    openCreate: scheduleData.openCreate,
    openEdit: scheduleData.openEdit,
    remove: scheduleData.remove,
    markLeave: scheduleData.markLeave,
    saveSchedule: scheduleData.saveSchedule,
    saving: scheduleData.saving,
    fixedSchedules: fixed.fixedSchedules,
    fixedLoading: fixed.fixedLoading,
    loadFixedSchedules: fixed.loadFixedSchedules,
    createFixed: fixed.createFixed,
    bulkCreateFixed: fixed.bulkCreateFixed,
    previewGenerate: fixed.previewGenerate,
    updateFixed: fixed.updateFixed,
    removeFixed: fixed.removeFixed,
    generateSchedules: fixed.generateSchedules,
    bulkCreate: fixed.bulkCreate,
    attendance: attendance.attendance,
    attendanceKpi: attendance.attendanceKpi,
    attendanceAdjustments: attendance.attendanceAdjustments,
    attendancePeriods: attendance.attendancePeriods,
    statusCatalog: scheduleData.statusCatalog,
    attendanceStatusCatalog: scheduleData.attendanceStatusCatalog,
    leaveStatusCatalog: scheduleData.leaveStatusCatalog,
    leaves: attendance.leaves,
    createLeave: attendance.createLeave,
    reviewLeave: attendance.reviewLeave,
    cancelLeave: attendance.cancelLeave,
    getAdjustments: attendance.getAdjustments,
    getAttendance: attendance.getAttendance,
    checkIn: attendance.checkIn,
    checkOut: attendance.checkOut,
    finalizeAbsent: attendance.finalizeAbsent,
    requestAttendanceAdjustment: attendance.requestAttendanceAdjustment,
    reviewAttendanceAdjustment: attendance.reviewAttendanceAdjustment,
    createAttendancePeriod: attendance.createAttendancePeriod,
    toggleAttendancePeriod: attendance.toggleAttendancePeriod,
    selectedCoSo: scheduleData.selectedCoSo,
    selectedKhoa: scheduleData.selectedKhoa,
    setNote: scheduleData.setNote,
    setSelectedCoSo: scheduleData.setSelectedCoSo,
    setSelectedKhoa: scheduleData.setSelectedKhoa,
    setWeekStart: scheduleData.setWeekStart,
    weekStart: scheduleData.weekStart,
    shifts: scheduleData.shifts,
    weekDays: scheduleData.weekDays,
    goToday: () => scheduleData.setWeekStart(dayjs().startOf('week').add(1, 'day')),
  };
};
