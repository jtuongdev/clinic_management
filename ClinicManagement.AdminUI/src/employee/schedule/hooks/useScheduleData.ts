import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { scheduleApi, type Employee, type Shift } from '../api/schedule.api';
import { coSoApi } from '../../../facility/api/facility.api';
import { khoaApi } from '../../../department/api/department.api';
import type { CoSoDropdownDto } from '../../../facility/type/facility.type';
import type { KhoaDropdownDto } from '../../../department/type/department.type';
import type { Schedule } from '../types/schedule.types';

const dateFormat = 'YYYY-MM-DD';
const startOfWeek = (date: Dayjs): Dayjs => date.startOf('week').add(1, 'day');
const apiError = (error: unknown): string => {
  const data = (error as {
    response?: { data?: { message?: string; detail?: string; errors?: string[] } };
  })?.response?.data;
  return data?.message
    || data?.detail
    || data?.errors?.join(', ')
    || 'Thao tác lịch làm việc thất bại.';
};

export const useScheduleData = () => {
  const { message, modal } = App.useApp();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [coSos, setCoSos] = useState<CoSoDropdownDto[]>([]);
  const [khoas, setKhoas] = useState<KhoaDropdownDto[]>([]);
  const [selectedCoSo, setSelectedCoSo] = useState<number>();
  const [selectedKhoa, setSelectedKhoa] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(dayjs()));
  const [activeCell, setActiveCell] = useState<{ shift: Shift; date: Dayjs } | null>(null);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [note, setNote] = useState('');
  const [roomId, setRoomId] = useState<number | undefined>();
  const [dailyStatus, setDailyStatus] = useState<'LAM_VIEC' | 'NGHI' | 'HUY'>('LAM_VIEC');
  const [saving, setSaving] = useState(false);
  const [statusCatalog, setStatusCatalog] = useState<Record<string, string>>({});
  const [attendanceStatusCatalog, setAttendanceStatusCatalog] = useState<Record<string, string>>({});
  const [leaveStatusCatalog, setLeaveStatusCatalog] = useState<Record<string, string>>({});

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day')),
    [weekStart],
  );

  const fetchSchedules = useCallback(async (): Promise<Schedule[]> => {
    const response = await scheduleApi.get({
      fromDate: weekDays[0].format(dateFormat),
      toDate: weekDays[6].format(dateFormat),
      maKhoa: selectedKhoa,
    });
    return response.data.data || [];
  }, [selectedKhoa, weekDays]);

  const loadSchedules = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setSchedules(await fetchSchedules());
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules, message]);

  const loadSchedulesRange = useCallback(async (fromDate: Dayjs, toDate: Dayjs): Promise<void> => {
    setLoading(true);
    try {
      const response = await scheduleApi.get({
        fromDate: fromDate.format(dateFormat),
        toDate: toDate.format(dateFormat),
        maKhoa: selectedKhoa,
      });
      setSchedules(response.data.data || []);
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [message, selectedKhoa]);

  useEffect(() => {
    Promise.all([
      scheduleApi.getStatusCatalog(),
      scheduleApi.getAttendanceStatusCatalog(),
      scheduleApi.getLeaveStatusCatalog(),
    ]).then(([scheduleResponse, attendanceResponse, leaveResponse]) => {
      setStatusCatalog(Object.fromEntries((scheduleResponse.data.data || []).map(item => [item.code, item.label])));
      setAttendanceStatusCatalog(Object.fromEntries((attendanceResponse.data.data || []).map(item => [item.code, item.label])));
      setLeaveStatusCatalog(Object.fromEntries((leaveResponse.data.data || []).map(item => [item.code, item.label])));
    }).catch(error => message.error(apiError(error)));
  }, [message]);

  useEffect(() => {
    let active = true;
    const fetchInitialData = async (): Promise<void> => {
      try {
        const [employeeResponse, shiftResponse, allEmpResponse] = await Promise.all([
          scheduleApi.getEmployees(selectedKhoa, selectedCoSo),
          scheduleApi.getShifts(),
          scheduleApi.getEmployees(undefined, selectedCoSo),
        ]);
        if (!active) return;
        const allRaw = allEmpResponse.data?.data;
        const allList: Employee[] = Array.isArray(allRaw) ? allRaw : ((allRaw as any)?.items || []);
        const normalizedAll = allList.map((e: any) => ({
          ...e,
          username: e.username || e.maNhanVien || '',
          maNhanVien: e.maNhanVien || e.username || '',
          chucVu: e.chucVu || e.tenChucVu || 'Nhân viên',
        }));
        setAllEmployees(normalizedAll);

        const raw = employeeResponse.data?.data;
        let empList: Employee[] = Array.isArray(raw) ? raw : ((raw as any)?.items || []);
        if (empList.length === 0 && selectedKhoa) {
          if (normalizedAll.length > 0) {
            empList = normalizedAll;
          }
        }
        const normalizedEmployees = empList.map((e: any) => ({
          ...e,
          username: e.username || e.maNhanVien || '',
          maNhanVien: e.maNhanVien || e.username || '',
          chucVu: e.chucVu || e.tenChucVu || 'Nhân viên',
        }));
        setEmployees(normalizedEmployees);
        setShifts(shiftResponse.data.data || []);
      } catch (error) {
        if (active) message.error(apiError(error));
      }
    };
    fetchInitialData();
    return () => { active = false; };
  }, [message, selectedKhoa, selectedCoSo]);

  useEffect(() => {
    let active = true;
    coSoApi.getDropdown().then((response) => {
      if (!active) return;
      const options = response.data?.data || [];
      setCoSos(options);
      if (options.length > 0) {
        setSelectedCoSo((prev) => (prev && options.some((o) => o.id === prev) ? prev : options[0].id));
      }
    }).catch((error) => {
      if (active) message.error(apiError(error));
    });
    return () => { active = false; };
  }, [message]);

  useEffect(() => {
    if (!selectedCoSo) {
      setKhoas([]);
      setSelectedKhoa(undefined);
      return undefined;
    }
    let active = true;
    khoaApi.getDropdown(selectedCoSo).then((response) => {
      if (!active) return;
      const options = response.data?.data || [];
      setKhoas(options);
      if (options.length > 0) {
        setSelectedKhoa((prev) => (prev && options.some((k) => k.id === prev) ? prev : options[0].id));
      } else {
        setSelectedKhoa(undefined);
      }
    }).catch((error) => {
      if (active) message.error(apiError(error));
    });
    return () => { active = false; };
  }, [message, selectedCoSo]);

  useEffect(() => {
    let active = true;
    const refreshSchedules = async (): Promise<void> => {
      setLoading(true);
      try {
        const data = await fetchSchedules();
        if (active) setSchedules(data);
      } catch (error) {
        if (active) message.error(apiError(error));
      } finally {
        if (active) setLoading(false);
      }
    };
    refreshSchedules();
    return () => { active = false; };
  }, [fetchSchedules, message]);

  const closeEditor = (): void => {
    setActiveCell(null);
    setEditing(null);
    setNote('');
    setRoomId(undefined);
    setDailyStatus('LAM_VIEC');
  };

  const openCreate = (shift: Shift, date: Dayjs): void => {
    setEditing(null);
    setNote('');
    setActiveCell({ shift, date });
  };

  const openEdit = (schedule: Schedule): void => {
    setActiveCell(null);
    setEditing(schedule);
    setNote(schedule.ghiChu || '');
    setRoomId(schedule.maPhongKham);
    setDailyStatus(schedule.trangThai);
  };

  const saveSchedule = async (selectionId: number): Promise<void> => {
    const employeeId = Number(editing?.maNhanVien || selectionId);
    const shiftId = Number(editing ? selectionId : activeCell?.shift.id);
    const date = editing?.ngayLam || activeCell?.date.format(dateFormat);
    if (!selectedKhoa || !employeeId || !shiftId || !date) {
      message.error('Vui lòng chọn khoa, nhân viên và ca làm việc hợp lệ.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await scheduleApi.update(editing.id, {
          maCaTruc: shiftId,
          ngayLam: date,
          ghiChu: note,
          maPhongKham: roomId,
          trangThai: dailyStatus,
        });
        message.success('Cập nhật lịch làm việc thành công.');
      } else {
        await scheduleApi.create({
          maNhanVien: employeeId,
          maKhoa: selectedKhoa,
          maCaTruc: shiftId,
          ngayLam: date,
          ghiChu: note,
          maPhongKham: roomId,
          trangThai: dailyStatus,
        });
        message.success('Tạo lịch làm việc thành công.');
      }
      closeEditor();
      setSchedules(await fetchSchedules());
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = (schedule: Schedule): void => {
    modal.confirm({
      title: 'Xóa lịch làm việc?',
      content: `${schedule.tenNhanVien} - ${schedule.tenCa}`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await scheduleApi.remove(schedule.id);
          message.success('Đã xóa lịch làm việc.');
          setSchedules(await fetchSchedules());
        } catch (error) {
          message.error(apiError(error));
        }
      },
    });
  };

  const markLeave = async (schedule: Schedule): Promise<void> => {
    modal.confirm({
      title: 'Ghi nhận nghỉ trong ngày?',
      content: `${schedule.tenNhanVien} - ${schedule.tenCa}. Lịch cố định sẽ không bị thay đổi.`,
      okText: 'Xác nhận nghỉ',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await scheduleApi.update(schedule.id, {
            maCaTruc: schedule.maCaTruc,
            maPhongKham: schedule.maPhongKham,
            ngayLam: schedule.ngayLam,
            ghiChu: schedule.ghiChu,
            trangThai: 'NGHI',
          });
          message.success('Đã ghi nhận nhân viên nghỉ trong ngày.');
          setSchedules(await fetchSchedules());
        } catch (error) {
          message.error(apiError(error));
        }
      },
    });
  };

  return {
    activeCell,
    coSos,
    employees,
    allEmployees,
    editing,
    schedules,
    khoas,
    loadSchedules,
    loadSchedulesRange,
    loading,
    closeEditor,
    note,
    roomId,
    setRoomId,
    dailyStatus,
    setDailyStatus,
    openCreate,
    openEdit,
    remove,
    markLeave,
    saveSchedule,
    saving,
    statusCatalog,
    attendanceStatusCatalog,
    leaveStatusCatalog,
    selectedCoSo,
    selectedKhoa,
    setNote,
    setSelectedCoSo,
    setSelectedKhoa,
    setWeekStart,
    weekStart,
    shifts,
    weekDays,
    goToday: () => setWeekStart(startOfWeek(dayjs())),
  };
};
