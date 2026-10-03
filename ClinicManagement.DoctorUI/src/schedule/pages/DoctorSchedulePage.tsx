import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  doctorScheduleApi,
  type ScheduleItemDto,
  type AttendanceItemDto,
  type TodayStatusDto,
} from '../api/doctorSchedule.api';
import './DoctorSchedulePage.css';

// Default column widths for Schedule tab
const DEFAULT_SCHED_COL_WIDTHS: Record<string, number> = {
  stt: 48,
  ngayLam: 140,
  tenCa: 120,
  khungGio: 140,
  soGioLam: 80,
  khoaPhong: 230,
  nguonLich: 120,
  trangThai: 110,
  ghiChu: 260,
};

// Default column widths for Attendance tab
const DEFAULT_ATT_COL_WIDTHS: Record<string, number> = {
  stt: 48,
  ngayChamCong: 140,
  tenCa: 120,
  checkIn: 110,
  checkOut: 110,
  gioThucTe: 96,
  diMuonVeSom: 140,
  trangThai: 110,
  ghiChu: 260,
};

// Column definitions for Schedule tab
const SCHED_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'text-center' },
  { key: 'ngayLam', label: 'Ngày Làm', align: 'text-center' },
  { key: 'tenCa', label: 'Ca Trực', align: 'text-center' },
  { key: 'khungGio', label: 'Khung Giờ', align: 'text-center' },
  { key: 'soGioLam', label: 'Số Giờ', align: 'text-right' },
  { key: 'khoaPhong', label: 'Khoa / Phòng Khám', align: 'text-left' },
  { key: 'nguonLich', label: 'Nguồn Lịch', align: 'text-center' },
  { key: 'trangThai', label: 'Trạng Thái', align: 'text-center' },
  { key: 'ghiChu', label: 'Ghi Chú', align: 'text-left' },
];

// Column definitions for Attendance tab
const ATT_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'text-center' },
  { key: 'ngayChamCong', label: 'Ngày Chấm Công', align: 'text-center' },
  { key: 'tenCa', label: 'Ca Trực', align: 'text-center' },
  { key: 'checkIn', label: 'Check-in', align: 'text-center' },
  { key: 'checkOut', label: 'Check-out', align: 'text-center' },
  { key: 'gioThucTe', label: 'Giờ Thực Tế', align: 'text-right' },
  { key: 'diMuonVeSom', label: 'Đi Muộn / Về Sớm', align: 'text-center' },
  { key: 'trangThai', label: 'Trạng Thái', align: 'text-center' },
  { key: 'ghiChu', label: 'Ghi Chú', align: 'text-left' },
];

export const DoctorSchedulePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance'>('schedule');
  const [todayStatus, setTodayStatus] = useState<TodayStatusDto | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItemDto[]>([]);
  const [attendances, setAttendances] = useState<AttendanceItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  // Search keyword states
  const [schedSearch, setSchedSearch] = useState<string>('');
  const [attSearch, setAttSearch] = useState<string>('');

  // Custom reordered row lists
  const [customSchedules, setCustomSchedules] = useState<ScheduleItemDto[]>([]);
  const [customAttendances, setCustomAttendances] = useState<AttendanceItemDto[]>([]);

  // Column Reordering states
  const [schedColOrder, setSchedColOrder] = useState<string[]>(() => SCHED_COLUMNS.map((c) => c.key));
  const [attColOrder, setAttColOrder] = useState<string[]>(() => ATT_COLUMNS.map((c) => c.key));
  const [draggedColKey, setDraggedColKey] = useState<string | null>(null);
  const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);

  // Row Reordering states
  const [draggedRowKey, setDraggedRowKey] = useState<string | null>(null);
  const [dragOverRowKey, setDragOverRowKey] = useState<string | null>(null);

  // Pagination states
  const [schedPage, setSchedPage] = useState<number>(1);
  const [schedPageSize, setSchedPageSize] = useState<number>(20);
  const [attPage, setAttPage] = useState<number>(1);
  const [attPageSize, setAttPageSize] = useState<number>(20);

  // Column Resizing states (pixel widths)
  const [schedColWidths, setSchedColWidths] = useState<Record<string, number>>(DEFAULT_SCHED_COL_WIDTHS);
  const [attColWidths, setAttColWidths] = useState<Record<string, number>>(DEFAULT_ATT_COL_WIDTHS);

  // Row Resizing states (pixel heights per row key)
  const [schedRowHeights, setSchedRowHeights] = useState<Record<string, number>>({});
  const [attRowHeights, setAttRowHeights] = useState<Record<string, number>>({});

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [todayRes, schedRes, attRes] = await Promise.all([
        doctorScheduleApi.getTodayStatus(),
        doctorScheduleApi.getMySchedule(),
        doctorScheduleApi.getMyAttendance(),
      ]);

      if (todayRes?.data) setTodayStatus(todayRes.data);

      const schedData = Array.isArray(schedRes?.data)
        ? schedRes.data
        : (Array.isArray(schedRes) ? schedRes : []);
      setSchedules(schedData);

      const attData = Array.isArray(attRes?.data)
        ? attRes.data
        : (Array.isArray(attRes) ? attRes : []);
      setAttendances(attData);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu lịch và chấm công:', err);
      toast.error('Không thể tải dữ liệu lịch làm việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void loadData();
      }
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [loadData]);

  // Selected shift for check-in if multiple shifts exist
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  useEffect(() => {
    if (todayStatus?.schedule?.id) {
      setSelectedShiftId(todayStatus.schedule.id);
    }
  }, [todayStatus]);

  // =========================================================================
  // EXCEL RESIZING ENGINE (COLUMN & ROW DRAG HANDLERS)
  // =========================================================================

  const handleColResizeStart = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isAttendance = activeTab === 'attendance';
    const startX = e.clientX;
    const currentWidth = isAttendance
      ? (attColWidths[colKey] || DEFAULT_ATT_COL_WIDTHS[colKey] || 100)
      : (schedColWidths[colKey] || DEFAULT_SCHED_COL_WIDTHS[colKey] || 100);

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, currentWidth + deltaX); // Safe bound minWidth: 50px
      if (isAttendance) {
        setAttColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
      } else {
        setSchedColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('is-resizing-col');
    };

    document.body.classList.add('is-resizing-col');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleRowResizeStart = (e: React.MouseEvent, rowKey: string, currentRowHeight: number) => {
    e.preventDefault();
    e.stopPropagation();

    const isAttendance = activeTab === 'attendance';
    const startY = e.clientY;
    const startHeight = currentRowHeight || 36;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(32, startHeight + deltaY); // Safe bound minHeight: 32px
      if (isAttendance) {
        setAttRowHeights((prev) => ({ ...prev, [rowKey]: newHeight }));
      } else {
        setSchedRowHeights((prev) => ({ ...prev, [rowKey]: newHeight }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('is-resizing-row');
    };

    document.body.classList.add('is-resizing-row');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Filtered schedules & attendances by search keywords
  const filteredSchedules = useMemo(() => {
    if (!schedSearch.trim()) return schedules;
    const q = schedSearch.toLowerCase().trim();
    return schedules.filter((s) => {
      return (
        (s.tenCa && s.tenCa.toLowerCase().includes(q)) ||
        (s.tenKhoa && s.tenKhoa.toLowerCase().includes(q)) ||
        (s.tenPhongKham && s.tenPhongKham.toLowerCase().includes(q)) ||
        (s.ghiChu && s.ghiChu.toLowerCase().includes(q)) ||
        (s.ngayLam && s.ngayLam.includes(q))
      );
    });
  }, [schedules, schedSearch]);

  const filteredAttendances = useMemo(() => {
    if (!attSearch.trim()) return attendances;
    const q = attSearch.toLowerCase().trim();
    return attendances.filter((a) => {
      return (
        (a.tenCa && a.tenCa.toLowerCase().includes(q)) ||
        (a.ghiChu && a.ghiChu.toLowerCase().includes(q)) ||
        (a.ngayChamCong && a.ngayChamCong.includes(q)) ||
        (a.trangThai && a.trangThai.toLowerCase().includes(q))
      );
    });
  }, [attendances, attSearch]);

  // Sync custom reordered lists with filtered data
  useEffect(() => {
    setCustomSchedules(filteredSchedules);
  }, [filteredSchedules]);

  useEffect(() => {
    setCustomAttendances(filteredAttendances);
  }, [filteredAttendances]);

  // Column Drop Handlers
  const handleSchedColDrop = (targetKey: string) => {
    if (!draggedColKey || draggedColKey === targetKey || draggedColKey === 'stt' || targetKey === 'stt') {
      setDraggedColKey(null);
      setDragOverColKey(null);
      return;
    }
    setSchedColOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(draggedColKey);
      const toIdx = next.indexOf(targetKey);
      if (fromIdx !== -1 && toIdx !== -1) {
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, draggedColKey);
      }
      return next;
    });
    setDraggedColKey(null);
    setDragOverColKey(null);
  };

  const handleAttColDrop = (targetKey: string) => {
    if (!draggedColKey || draggedColKey === targetKey || draggedColKey === 'stt' || targetKey === 'stt') {
      setDraggedColKey(null);
      setDragOverColKey(null);
      return;
    }
    setAttColOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(draggedColKey);
      const toIdx = next.indexOf(targetKey);
      if (fromIdx !== -1 && toIdx !== -1) {
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, draggedColKey);
      }
      return next;
    });
    setDraggedColKey(null);
    setDragOverColKey(null);
  };

  // Row Drop Handlers
  const handleSchedRowDrop = (targetRowKey: string) => {
    if (!draggedRowKey || draggedRowKey === targetRowKey) {
      setDraggedRowKey(null);
      setDragOverRowKey(null);
      return;
    }
    setCustomSchedules((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((s, idx) => `sched-row-${s.id || idx}` === draggedRowKey);
      const toIdx = next.findIndex((s, idx) => `sched-row-${s.id || idx}` === targetRowKey);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
      }
      return next;
    });
    setDraggedRowKey(null);
    setDragOverRowKey(null);
  };

  const handleAttRowDrop = (targetRowKey: string) => {
    if (!draggedRowKey || draggedRowKey === targetRowKey) {
      setDraggedRowKey(null);
      setDragOverRowKey(null);
      return;
    }
    setCustomAttendances((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((a, idx) => `att-row-${a.id || idx}` === draggedRowKey);
      const toIdx = next.findIndex((a, idx) => `att-row-${a.id || idx}` === targetRowKey);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
      }
      return next;
    });
    setDraggedRowKey(null);
    setDragOverRowKey(null);
  };

  const handleResetGridSizes = () => {
    if (activeTab === 'schedule') {
      setSchedColWidths(DEFAULT_SCHED_COL_WIDTHS);
      setSchedRowHeights({});
      setSchedColOrder(SCHED_COLUMNS.map((c) => c.key));
      setCustomSchedules(filteredSchedules);
    } else {
      setAttColWidths(DEFAULT_ATT_COL_WIDTHS);
      setAttRowHeights({});
      setAttColOrder(ATT_COLUMNS.map((c) => c.key));
      setCustomAttendances(filteredAttendances);
    }
    toast.success('Đã khôi phục kích thước và thứ tự ô lưới mặc định');
  };

  // Handle Check-in / Check-out
  const handleCheckIn = async (shiftId?: number) => {
    try {
      setActionLoading(true);
      const targetId = shiftId || selectedShiftId || todayStatus?.schedule?.id;
      const res = await doctorScheduleApi.checkIn(note, targetId || undefined);
      toast.success(res.message || 'Check-in thành công!');
      setNote('');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Check-in thất bại.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await doctorScheduleApi.checkOut(note);
      toast.success(res.message || 'Check-out thành công!');
      setNote('');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Check-out thất bại.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dStr?: string) => {
    if (!dStr) return '--';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (tStr?: string) => {
    if (!tStr) return '--:--';
    if (tStr.includes('T')) {
      const d = new Date(tStr);
      if (isNaN(d.getTime())) return tStr;
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return tStr.substring(0, 5);
  };

  const formatTimeSpan = (t?: string | any) => {
    if (!t) return '--:--';
    if (typeof t === 'string') return t.substring(0, 5);
    return String(t).substring(0, 5);
  };

  const renderSourceBadge = (src: string) => {
    if (src === 'TU_DONG_THEO_LICH_MAU') {
      return <span className="badge-source auto" title="Tự động sinh theo lịch mẫu"><i className="fa-solid fa-wand-magic-sparkles"></i> Lịch Mẫu</span>;
    }
    if (src === 'PHAT_SINH_THU_CONG') {
      return <span className="badge-source manual" title="Phân công đột xuất"><i className="fa-solid fa-hand"></i> Đột Xuất</span>;
    }
    if (src === 'DOI_CA') {
      return <span className="badge-source swap" title="Lịch được đổi ca"><i className="fa-solid fa-arrow-right-arrow-left"></i> Đổi Ca</span>;
    }
    return <span className="badge-source" title={src}>{src || 'Tiêu chuẩn'}</span>;
  };

  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case 'DUNG_GIO':
        return <span className="badge-status-tag on-time"><i className="fa-solid fa-circle-check"></i> Đúng giờ</span>;
      case 'DI_MUON':
        return <span className="badge-status-tag late"><i className="fa-solid fa-clock"></i> Đi muộn</span>;
      case 'VE_SOM':
        return <span className="badge-status-tag late"><i className="fa-solid fa-person-walking-arrow-right"></i> Về sớm</span>;
      case 'DI_MUON_VE_SOM':
        return <span className="badge-status-tag late"><i className="fa-solid fa-triangle-exclamation"></i> Muộn/Sớm</span>;
      case 'VANG_MAT':
        return <span className="badge-status-tag absent"><i className="fa-solid fa-circle-xmark"></i> Vắng mặt</span>;
      default:
        return <span className="badge-status-tag on-time">{status || 'Hoàn tất'}</span>;
    }
  };

  const currentActiveShift = todayStatus?.shifts?.find((s) => s.id === selectedShiftId) ||
    todayStatus?.shifts?.find((s) => s.isCurrentActive) ||
    todayStatus?.shifts?.[0];

  // Ordered column lists
  const orderedSchedColumns = useMemo(() => {
    const colMap = new Map(SCHED_COLUMNS.map((c) => [c.key, c]));
    return schedColOrder.map((key) => colMap.get(key)).filter(Boolean) as typeof SCHED_COLUMNS;
  }, [schedColOrder]);

  const orderedAttColumns = useMemo(() => {
    const colMap = new Map(ATT_COLUMNS.map((c) => [c.key, c]));
    return attColOrder.map((key) => colMap.get(key)).filter(Boolean) as typeof ATT_COLUMNS;
  }, [attColOrder]);

  // Paginated data based on customSchedules and customAttendances
  const schedTotal = customSchedules.length;
  const schedTotalPages = Math.max(1, Math.ceil(schedTotal / schedPageSize));
  const paginatedSchedules = useMemo(() => {
    const start = (schedPage - 1) * schedPageSize;
    return customSchedules.slice(start, start + schedPageSize);
  }, [customSchedules, schedPage, schedPageSize]);

  const attTotal = customAttendances.length;
  const attTotalPages = Math.max(1, Math.ceil(attTotal / attPageSize));
  const paginatedAttendances = useMemo(() => {
    const start = (attPage - 1) * attPageSize;
    return customAttendances.slice(start, start + attPageSize);
  }, [customAttendances, attPage, attPageSize]);

  // Cell renderer for Schedule tab
  const renderSchedCell = (
    colKey: string,
    s: ScheduleItemDto,
    stt: number,
    rowKey: string,
    rowHeight: number
  ) => {
    const startTime = formatTimeSpan(s.thoiGianBatDau);
    const endTime = formatTimeSpan(s.thoiGianKetThuc);
    const clinicRoom = s.tenPhongKham ? ` - ${s.tenPhongKham}` : '';
    const fullLocation = `${s.tenKhoa || '---'}${clinicRoom}`;

    switch (colKey) {
      case 'stt':
        return (
          <td
            key="stt"
            className="relative w-12 text-center font-mono font-semibold text-slate-500 bg-slate-100 align-middle px-2 py-1.5 border border-slate-300 select-none"
            style={{ height: `${rowHeight}px` }}
          >
            <div
              className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-mono font-bold text-xs"
              title={`Dòng ${stt}`}
            >
              <i
                className="fa-solid fa-grip-vertical text-slate-400 cursor-grab mr-1 text-[11px] opacity-60 hover:opacity-100"
                title="Kéo thả để sắp xếp hàng"
              />
              {stt}
            </div>
            {/* Row Resizer Handle */}
            <div
              className="row-resizer h-1.5 w-full absolute left-0 bottom-0 cursor-row-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
              onMouseDown={(e) => handleRowResizeStart(e, rowKey, rowHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Kéo chuột để đổi chiều cao dòng"
            />
          </td>
        );

      case 'ngayLam':
        return (
          <td key="ngayLam" className="text-center align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-semibold text-slate-800" title={formatDate(s.ngayLam)}>
              {formatDate(s.ngayLam)}
            </div>
          </td>
        );

      case 'tenCa':
        return (
          <td key="tenCa" className="text-center align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-semibold text-sky-800" title={s.tenCa || 'Theo ca'}>
              {s.tenCa || 'Theo ca'}
            </div>
          </td>
        );

      case 'khungGio':
        return (
          <td key="khungGio" className="text-center align-middle px-2 py-1.5 border border-slate-300 font-mono text-xs">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center text-slate-700" title={`${startTime} - ${endTime}`}>
              {startTime} - {endTime}
            </div>
          </td>
        );

      case 'soGioLam':
        return (
          <td key="soGioLam" className="text-right align-middle px-2 py-1.5 border border-slate-300 font-mono font-semibold text-slate-900">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-end" title={s.soGioLam != null ? `${s.soGioLam} giờ` : '---'}>
              {s.soGioLam != null ? `${s.soGioLam}h` : '---'}
            </div>
          </td>
        );

      case 'khoaPhong':
        return (
          <td key="khoaPhong" className="text-left align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-start text-slate-800 font-medium" title={fullLocation}>
              {fullLocation}
            </div>
          </td>
        );

      case 'nguonLich':
        return (
          <td key="nguonLich" className="text-center align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center">
              {renderSourceBadge(s.nguonLich)}
            </div>
          </td>
        );

      case 'trangThai':
        return (
          <td key="trangThai" className="text-center align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center">
              <span className={`badge-status-tag ${s.trangThai === 'DA_XAC_NHAN' ? 'on-time' : 'late'}`} title={s.trangThai}>
                <i className={`fa-solid ${s.trangThai === 'DA_XAC_NHAN' ? 'fa-circle-check' : 'fa-clock'}`}></i>
                {s.trangThai === 'DA_XAC_NHAN' ? 'Đã xác nhận' : (s.trangThai || 'Kế hoạch')}
              </span>
            </div>
          </td>
        );

      case 'ghiChu':
        return (
          <td key="ghiChu" className="text-left align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-start text-slate-500 text-xs" title={s.ghiChu || '---'}>
              {s.ghiChu || '---'}
            </div>
          </td>
        );

      default:
        return null;
    }
  };

  // Cell renderer for Attendance tab
  const renderAttCell = (
    colKey: string,
    a: AttendanceItemDto,
    stt: number,
    rowKey: string,
    rowHeight: number
  ) => {
    const lateMin = a.phutDiMuon ?? 0;
    const earlyMin = a.phutVeSom ?? 0;

    switch (colKey) {
      case 'stt':
        return (
          <td
            key="stt"
            className="relative w-12 text-center font-mono font-semibold text-slate-500 bg-slate-100 align-middle px-2 py-1.5 border border-slate-300 select-none"
            style={{ height: `${rowHeight}px` }}
          >
            <div
              className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-mono font-bold text-xs"
              title={`Dòng ${stt}`}
            >
              <i
                className="fa-solid fa-grip-vertical text-slate-400 cursor-grab mr-1 text-[11px] opacity-60 hover:opacity-100"
                title="Kéo thả để sắp xếp hàng"
              />
              {stt}
            </div>
            {/* Row Resizer Handle */}
            <div
              className="row-resizer h-1.5 w-full absolute left-0 bottom-0 cursor-row-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
              onMouseDown={(e) => handleRowResizeStart(e, rowKey, rowHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Kéo chuột để đổi chiều cao dòng"
            />
          </td>
        );

      case 'ngayChamCong':
        return (
          <td key="ngayChamCong" className="text-center align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-semibold text-slate-800" title={formatDate(a.ngayChamCong)}>
              {formatDate(a.ngayChamCong)}
            </div>
          </td>
        );

      case 'tenCa':
        return (
          <td key="tenCa" className="text-center align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center text-slate-800 font-medium" title={a.tenCa || 'Theo ca trực'}>
              {a.tenCa || 'Theo ca trực'}
            </div>
          </td>
        );

      case 'checkIn':
        return (
          <td key="checkIn" className="text-center align-middle px-2 py-1.5 border border-slate-300 font-mono text-xs">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={a.checkIn ? formatTime(a.checkIn) : 'Chưa check-in'}>
              {a.checkIn ? (
                <span className="font-semibold text-emerald-700">
                  <i className="fa-solid fa-arrow-down-long text-[10px] mr-1"></i>
                  {formatTime(a.checkIn)}
                </span>
              ) : (
                <span className="text-slate-400">---</span>
              )}
            </div>
          </td>
        );

      case 'checkOut':
        return (
          <td key="checkOut" className="text-center align-middle px-2 py-1.5 border border-slate-300 font-mono text-xs">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={a.checkOut ? formatTime(a.checkOut) : 'Chưa check-out'}>
              {a.checkOut ? (
                <span className="font-semibold text-amber-700">
                  <i className="fa-solid fa-arrow-up-long text-[10px] mr-1"></i>
                  {formatTime(a.checkOut)}
                </span>
              ) : (
                <span className="text-slate-400">---</span>
              )}
            </div>
          </td>
        );

      case 'gioThucTe':
        return (
          <td key="gioThucTe" className="text-right align-middle px-2 py-1.5 border border-slate-300 font-mono font-semibold text-slate-900">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-end" title={a.gioLamThucTe != null ? `${Number(a.gioLamThucTe).toFixed(1)} giờ` : '---'}>
              {a.gioLamThucTe != null ? `${Number(a.gioLamThucTe).toFixed(1)}h` : '---'}
            </div>
          </td>
        );

      case 'diMuonVeSom':
        return (
          <td key="diMuonVeSom" className="text-center align-middle px-2 py-1.5 border border-slate-300 text-xs">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={lateMin > 0 || earlyMin > 0 ? `Muộn: ${lateMin}p, Sớm: ${earlyMin}p` : 'Đúng giờ'}>
              {lateMin > 0 && (
                <span className="text-rose-600 font-semibold mr-1.5">
                  Muộn {lateMin}p
                </span>
              )}
              {earlyMin > 0 && (
                <span className="text-amber-600 font-semibold">
                  Sớm {earlyMin}p
                </span>
              )}
              {lateMin === 0 && earlyMin === 0 && (
                <span className="text-slate-400">Không</span>
              )}
            </div>
          </td>
        );

      case 'trangThai':
        return (
          <td key="trangThai" className="text-center align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={a.trangThai}>
              {renderAttendanceStatus(a.trangThai)}
            </div>
          </td>
        );

      case 'ghiChu':
        return (
          <td key="ghiChu" className="text-left align-middle px-2 py-1.5 border border-slate-300">
            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-start text-slate-500 text-xs" title={a.ghiChu || '---'}>
              {a.ghiChu || '---'}
            </div>
          </td>
        );

      default:
        return null;
    }
  };

  return (
    <div className="doctor-schedule-page">
      <div className="sched-header">
        <div className="sched-title">
          <i className="fa-solid fa-calendar-check" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
          <div>
            <h2>Lịch Làm Việc & Chấm Công</h2>
            <div className="sched-subtitle">Theo dõi lịch phân ca và chấm công tự động khớp ca theo thời gian thực</div>
          </div>
        </div>
        <button className="btn" onClick={loadData} disabled={loading}>
          <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`}></i> Làm mới
        </button>
      </div>

      {/* Top Cards: Digital Clock & Check-in action */}
      <div className="top-cards-row">
        {/* Digital Clock */}
        <div className="clock-card">
          <div className="clock-badge">
            <i className="fa-solid fa-satellite-dish"></i> Đồng hồ hệ thống
          </div>
          <div>
            <div className="clock-time">
              {currentTime.toLocaleTimeString('vi-VN', { hour12: false })}
            </div>
            <div className="clock-date">
              {currentTime.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Action Check-in Card */}
        <div className="action-card">
          <div className="action-card-header">
            <h3>
              <i className="fa-solid fa-fingerprint" style={{ color: 'var(--primary)' }}></i>
              Chấm Công Ca Làm Việc Hôm Nay
            </h3>
            {todayStatus?.attendance?.checkIn && !todayStatus.attendance.checkOut && (
              <span className="badge-status-tag on-time">
                <i className="fa-solid fa-circle-notch fa-spin"></i> Đang trong ca
              </span>
            )}
            {todayStatus?.attendance?.checkOut && (
              <span className="badge-status-tag on-time">
                <i className="fa-solid fa-circle-check"></i> Đã hoàn thành ca
              </span>
            )}
            {!todayStatus?.attendance?.checkIn && todayStatus?.hasSchedule && (
              <span className="badge-status-tag late">
                <i className="fa-solid fa-circle-pause"></i> Chưa Check-in
              </span>
            )}
            {!todayStatus?.hasSchedule && (
              <span className="badge-status-tag" style={{ background: '#f1f5f9', color: '#64748b' }}>
                Hôm nay không có ca
              </span>
            )}
          </div>

          {/* Multiple Shifts pills */}
          {todayStatus?.shifts && todayStatus.shifts.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {todayStatus.shifts.map((shift) => {
                const isSelected = (selectedShiftId === shift.id) || (!selectedShiftId && shift.isCurrentActive);
                let badgeClass = 'badge-status-tag on-time';
                let statusLabel = 'Chưa check-in';
                if (shift.checkIn && !shift.checkOut) {
                  statusLabel = 'Đang trực';
                  badgeClass = 'badge-status-tag on-time';
                } else if (shift.checkOut) {
                  statusLabel = 'Đã hoàn thành';
                  badgeClass = 'badge-status-tag on-time';
                } else if (shift.isExpired) {
                  statusLabel = 'Đã quá hạn';
                  badgeClass = 'badge-status-tag absent';
                } else if (shift.canCheckIn) {
                  statusLabel = 'Sẵn sàng check-in';
                  badgeClass = 'badge-status-tag on-time';
                }

                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => setSelectedShiftId(shift.id)}
                    style={{
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--line)',
                      background: isSelected ? 'var(--primary-soft)' : '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <span>{shift.tenCa} ({shift.thoiGianBatDau.substring(0, 5)} - {shift.thoiGianKetThuc.substring(0, 5)})</span>
                    <span className={badgeClass} style={{ fontSize: '9px', padding: '1px 5px' }}>{statusLabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentActiveShift ? (
            <div className="shift-info-box">
              <div>
                <div className="shift-title">
                  <i className="fa-regular fa-clock"></i> {currentActiveShift.tenCa} ({currentActiveShift.thoiGianBatDau.substring(0, 5)} - {currentActiveShift.thoiGianKetThuc.substring(0, 5)})
                </div>
                <div className="shift-details">
                  <span><i className="fa-solid fa-hospital-user"></i> Khoa: <strong>{currentActiveShift.tenKhoa || 'Đang cập nhật'}</strong></span>
                  <span><i className="fa-solid fa-door-open"></i> Phòng: <strong>{currentActiveShift.tenPhongKham || 'Chưa xếp'}</strong></span>
                  <span>Nguồn: {renderSourceBadge(currentActiveShift.nguonLich)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                {currentActiveShift.checkIn && (
                  <div>Vào: <strong>{formatTime(currentActiveShift.checkIn)}</strong></div>
                )}
                {currentActiveShift.checkOut && (
                  <div>Ra: <strong>{formatTime(currentActiveShift.checkOut)}</strong></div>
                )}
              </div>
            </div>
          ) : todayStatus?.schedule ? (
            <div className="shift-info-box">
              <div>
                <div className="shift-title">
                  <i className="fa-regular fa-clock"></i> {todayStatus.schedule.tenCa} ({todayStatus.schedule.thoiGianBatDau?.substring(0, 5)} - {todayStatus.schedule.thoiGianKetThuc?.substring(0, 5)})
                </div>
                <div className="shift-details">
                  <span><i className="fa-solid fa-hospital-user"></i> Khoa: <strong>{todayStatus.schedule.tenKhoa || 'Đang cập nhật'}</strong></span>
                  <span><i className="fa-solid fa-door-open"></i> Phòng: <strong>{todayStatus.schedule.tenPhongKham || 'Chưa xếp'}</strong></span>
                  <span>Nguồn: {renderSourceBadge(todayStatus.schedule.nguonLich)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                {todayStatus.attendance?.checkIn && (
                  <div>Vào: <strong>{formatTime(todayStatus.attendance.checkIn)}</strong></div>
                )}
                {todayStatus.attendance?.checkOut && (
                  <div>Ra: <strong>{formatTime(todayStatus.attendance.checkOut)}</strong></div>
                )}
              </div>
            </div>
          ) : (
            <div className="shift-info-box" style={{ background: '#f8fafc', borderLeftColor: '#94a3b8' }}>
              <span style={{ color: 'var(--muted)' }}>
                <i className="fa-solid fa-info-circle"></i> Bạn không có lịch trực được phân bổ trong ngày hôm nay ({new Date().toLocaleDateString('vi-VN')}).
              </span>
            </div>
          )}

          <div className="action-buttons-row">
            <input
              type="text"
              placeholder="Ghi chú chấm công (tùy chọn)..."
              className="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={actionLoading}
            />
            <button
              className="btn-checkin"
              onClick={() => handleCheckIn(selectedShiftId || undefined)}
              disabled={actionLoading || !(currentActiveShift ? currentActiveShift.canCheckIn : todayStatus?.canCheckIn)}
              title={!(currentActiveShift ? currentActiveShift.canCheckIn : todayStatus?.canCheckIn) ? 'Hiện không thể check-in' : 'Bấm để Check-in vào ca'}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Check-in Ca
            </button>
            <button
              className="btn-checkout"
              onClick={handleCheckOut}
              disabled={actionLoading || !(currentActiveShift ? currentActiveShift.canCheckOut : todayStatus?.canCheckOut)}
              title={!(currentActiveShift ? currentActiveShift.canCheckOut : todayStatus?.canCheckOut) ? 'Chỉ check-out sau khi đã check-in' : 'Bấm để Check-out kết thúc ca'}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Check-out Ca
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / Tabs */}
      <div className="content-card">
        <div className="card-nav-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('schedule');
                setSchedPage(1);
              }}
            >
              <i className="fa-solid fa-calendar-days"></i> Lịch Làm Việc ({customSchedules.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('attendance');
                setAttPage(1);
              }}
            >
              <i className="fa-solid fa-clipboard-user"></i> Lịch Sử Chấm Công ({customAttendances.length})
            </button>
          </div>

          <div className="table-toolbar flex items-center gap-3">
            {/* Search Input with Clear Button */}
            <div className="relative flex items-center">
              <i className="fa-solid fa-search absolute left-2 text-slate-400 text-xs pointer-events-none"></i>
              <input
                type="text"
                className="pl-7 pr-6 py-1 h-[28px] border border-slate-300 rounded text-xs text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-56"
                placeholder={activeTab === 'schedule' ? 'Tìm ngày, ca, phòng khám...' : 'Tìm ngày, ca, trạng thái...'}
                value={activeTab === 'schedule' ? schedSearch : attSearch}
                onChange={(e) => {
                  if (activeTab === 'schedule') {
                    setSchedSearch(e.target.value);
                    setSchedPage(1);
                  } else {
                    setAttSearch(e.target.value);
                    setAttPage(1);
                  }
                }}
              />
              {(activeTab === 'schedule' ? schedSearch : attSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'schedule') {
                      setSchedSearch('');
                      setSchedPage(1);
                    } else {
                      setAttSearch('');
                      setAttPage(1);
                    }
                  }}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none text-xs"
                  title="Xóa tìm kiếm"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <button
              type="button"
              className="btn-reset-grid"
              onClick={handleResetGridSizes}
              title="Đặt lại độ rộng cột, hàng và thứ tự về mặc định"
            >
              <i className="fa-solid fa-table-cells"></i> Đặt lại cỡ ô
            </button>
          </div>
        </div>

        <div className="table-container">
          {activeTab === 'schedule' ? (
            <div className="sched-table-wrap w-full overflow-auto border border-slate-300 rounded-none bg-white">
              <table className="table-fixed w-max min-w-full border-collapse border border-slate-300 divide-x divide-y divide-slate-300">
                <colgroup>
                  {orderedSchedColumns.map((col) => (
                    <col
                      key={col.key}
                      style={{ width: `${schedColWidths[col.key] || DEFAULT_SCHED_COL_WIDTHS[col.key] || 100}px` }}
                    />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    {orderedSchedColumns.map((col) => {
                      const canDrag = col.key !== 'stt';
                      const isDragged = draggedColKey === col.key;
                      const isOver = dragOverColKey === col.key;

                      return (
                        <th
                          key={col.key}
                          draggable={canDrag}
                          onDragStart={(e) => {
                            if (canDrag) {
                              e.dataTransfer.setData('text/plain', col.key);
                              setDraggedColKey(col.key);
                            }
                          }}
                          onDragOver={(e) => {
                            if (canDrag) {
                              e.preventDefault();
                              setDragOverColKey(col.key);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverColKey === col.key) {
                              setDragOverColKey(null);
                            }
                          }}
                          onDrop={(e) => {
                            if (canDrag) {
                              e.preventDefault();
                              handleSchedColDrop(col.key);
                            }
                          }}
                          style={{
                            width: schedColWidths[col.key] || DEFAULT_SCHED_COL_WIDTHS[col.key] || 100,
                            opacity: isDragged ? 0.4 : 1,
                          }}
                          className={`relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none ${col.align} ${
                            isOver ? 'bg-blue-100 border-l-2 border-l-blue-600' : ''
                          }`}
                        >
                          <div
                            className={`w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${
                              col.align === 'text-center'
                                ? 'justify-center'
                                : col.align === 'text-right'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                            title={col.label}
                          >
                            {canDrag && (
                              <i
                                className="fa-solid fa-grip-vertical text-slate-400 cursor-grab mr-1 text-[10px] opacity-40 hover:opacity-100"
                                title="Kéo chuột để đổi vị trí cột"
                              />
                            )}
                            <span>{col.label}</span>
                          </div>
                          {/* Resizer Handle */}
                          <div
                            className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                            onMouseDown={(e) => handleColResizeStart(e, col.key)}
                            onClick={(e) => e.stopPropagation()}
                            title="Kéo chuột để đổi độ rộng cột"
                          />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={orderedSchedColumns.length} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-500">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu lịch làm việc...
                      </td>
                    </tr>
                  ) : customSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={orderedSchedColumns.length} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-400">
                        Chưa có lịch làm việc được phân bổ.
                      </td>
                    </tr>
                  ) : (
                    paginatedSchedules.map((s, idx) => {
                      const stt = (schedPage - 1) * schedPageSize + idx + 1;
                      const rowKey = `sched-row-${s.id || idx}`;
                      const rowHeight = schedRowHeights[rowKey] || 36;
                      const isRowOver = dragOverRowKey === rowKey;
                      const isRowDragged = draggedRowKey === rowKey;

                      return (
                        <tr
                          key={s.id || idx}
                          style={{ height: `${rowHeight}px`, opacity: isRowDragged ? 0.4 : 1 }}
                          className={`even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors ${
                            isRowOver ? 'border-t-2 border-t-blue-500 bg-blue-50/50' : ''
                          }`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', rowKey);
                            setDraggedRowKey(rowKey);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverRowKey(rowKey);
                          }}
                          onDragLeave={() => {
                            if (dragOverRowKey === rowKey) {
                              setDragOverRowKey(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleSchedRowDrop(rowKey);
                          }}
                        >
                          {orderedSchedColumns.map((col) =>
                            renderSchedCell(col.key, s, stt, rowKey, rowHeight)
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="sched-table-wrap w-full overflow-auto border border-slate-300 rounded-none bg-white">
              <table className="table-fixed w-max min-w-full border-collapse border border-slate-300 divide-x divide-y divide-slate-300">
                <colgroup>
                  {orderedAttColumns.map((col) => (
                    <col
                      key={col.key}
                      style={{ width: `${attColWidths[col.key] || DEFAULT_ATT_COL_WIDTHS[col.key] || 100}px` }}
                    />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    {orderedAttColumns.map((col) => {
                      const canDrag = col.key !== 'stt';
                      const isDragged = draggedColKey === col.key;
                      const isOver = dragOverColKey === col.key;

                      return (
                        <th
                          key={col.key}
                          draggable={canDrag}
                          onDragStart={(e) => {
                            if (canDrag) {
                              e.dataTransfer.setData('text/plain', col.key);
                              setDraggedColKey(col.key);
                            }
                          }}
                          onDragOver={(e) => {
                            if (canDrag) {
                              e.preventDefault();
                              setDragOverColKey(col.key);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverColKey === col.key) {
                              setDragOverColKey(null);
                            }
                          }}
                          onDrop={(e) => {
                            if (canDrag) {
                              e.preventDefault();
                              handleAttColDrop(col.key);
                            }
                          }}
                          style={{
                            width: attColWidths[col.key] || DEFAULT_ATT_COL_WIDTHS[col.key] || 100,
                            opacity: isDragged ? 0.4 : 1,
                          }}
                          className={`relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none ${col.align} ${
                            isOver ? 'bg-blue-100 border-l-2 border-l-blue-600' : ''
                          }`}
                        >
                          <div
                            className={`w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${
                              col.align === 'text-center'
                                ? 'justify-center'
                                : col.align === 'text-right'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                            title={col.label}
                          >
                            {canDrag && (
                              <i
                                className="fa-solid fa-grip-vertical text-slate-400 cursor-grab mr-1 text-[10px] opacity-40 hover:opacity-100"
                                title="Kéo chuột để đổi vị trí cột"
                              />
                            )}
                            <span>{col.label}</span>
                          </div>
                          {/* Resizer Handle */}
                          <div
                            className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                            onMouseDown={(e) => handleColResizeStart(e, col.key)}
                            onClick={(e) => e.stopPropagation()}
                            title="Kéo chuột để đổi độ rộng cột"
                          />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={orderedAttColumns.length} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-500">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải lịch sử chấm công...
                      </td>
                    </tr>
                  ) : customAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={orderedAttColumns.length} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-400">
                        Chưa có bản ghi chấm công nào trong kỳ này.
                      </td>
                    </tr>
                  ) : (
                    paginatedAttendances.map((a, idx) => {
                      const stt = (attPage - 1) * attPageSize + idx + 1;
                      const rowKey = `att-row-${a.id || idx}`;
                      const rowHeight = attRowHeights[rowKey] || 36;
                      const isRowOver = dragOverRowKey === rowKey;
                      const isRowDragged = draggedRowKey === rowKey;

                      return (
                        <tr
                          key={a.id || idx}
                          style={{ height: `${rowHeight}px`, opacity: isRowDragged ? 0.4 : 1 }}
                          className={`even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors ${
                            isRowOver ? 'border-t-2 border-t-blue-500 bg-blue-50/50' : ''
                          }`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', rowKey);
                            setDraggedRowKey(rowKey);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverRowKey(rowKey);
                          }}
                          onDragLeave={() => {
                            if (dragOverRowKey === rowKey) {
                              setDragOverRowKey(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleAttRowDrop(rowKey);
                          }}
                        >
                          {orderedAttColumns.map((col) =>
                            renderAttCell(col.key, a, stt, rowKey, rowHeight)
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Excel Status Bar & Pagination Footer */}
          {activeTab === 'schedule' ? (
            <div className="sched-pagination">
              <div className="pagination-info">
                <span>Hiển thị</span>
                <strong>{schedTotal === 0 ? 0 : (schedPage - 1) * schedPageSize + 1} - {Math.min(schedPage * schedPageSize, schedTotal)}</strong>
                <span>trên tổng số</span>
                <strong>{schedTotal.toLocaleString('vi-VN')}</strong>
                <span>ca làm việc</span>
              </div>

              <div className="pagination-controls">
                <div className="page-size-selector">
                  <span>Dòng/trang:</span>
                  <select
                    value={schedPageSize}
                    onChange={(e) => {
                      setSchedPageSize(Number(e.target.value));
                      setSchedPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="page-buttons">
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={schedPage <= 1}
                    onClick={() => setSchedPage(1)}
                    title="Về trang đầu"
                  >
                    <i className="fa-solid fa-angles-left"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={schedPage <= 1}
                    onClick={() => setSchedPage(p => Math.max(1, p - 1))}
                    title="Trang trước"
                  >
                    <i className="fa-solid fa-angle-left"></i>
                  </button>

                  <span className="page-current">
                    Trang <strong>{schedPage}</strong> / {schedTotalPages}
                  </span>

                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={schedPage >= schedTotalPages}
                    onClick={() => setSchedPage(p => Math.min(schedTotalPages, p + 1))}
                    title="Trang sau"
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={schedPage >= schedTotalPages}
                    onClick={() => setSchedPage(schedTotalPages)}
                    title="Đến trang cuối"
                  >
                    <i className="fa-solid fa-angles-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sched-pagination">
              <div className="pagination-info">
                <span>Hiển thị</span>
                <strong>{attTotal === 0 ? 0 : (attPage - 1) * attPageSize + 1} - {Math.min(attPage * attPageSize, attTotal)}</strong>
                <span>trên tổng số</span>
                <strong>{attTotal.toLocaleString('vi-VN')}</strong>
                <span>bản ghi chấm công</span>
              </div>

              <div className="pagination-controls">
                <div className="page-size-selector">
                  <span>Dòng/trang:</span>
                  <select
                    value={attPageSize}
                    onChange={(e) => {
                      setAttPageSize(Number(e.target.value));
                      setAttPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="page-buttons">
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={attPage <= 1}
                    onClick={() => setAttPage(1)}
                    title="Về trang đầu"
                  >
                    <i className="fa-solid fa-angles-left"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={attPage <= 1}
                    onClick={() => setAttPage(p => Math.max(1, p - 1))}
                    title="Trang trước"
                  >
                    <i className="fa-solid fa-angle-left"></i>
                  </button>

                  <span className="page-current">
                    Trang <strong>{attPage}</strong> / {attTotalPages}
                  </span>

                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={attPage >= attTotalPages}
                    onClick={() => setAttPage(p => Math.min(attTotalPages, p + 1))}
                    title="Trang sau"
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={attPage >= attTotalPages}
                    onClick={() => setAttPage(attTotalPages)}
                    title="Đến trang cuối"
                  >
                    <i className="fa-solid fa-angles-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
