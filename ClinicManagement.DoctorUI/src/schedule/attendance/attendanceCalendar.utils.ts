import type { AttendanceItemDto, ScheduleItemDto } from '../api/doctorSchedule.api';

// ============================================================================
// Date helpers (all keys are local yyyy-MM-dd strings)
// ============================================================================

export interface MonthRef {
  year: number;
  month: number; // 1-12
}

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = () => toDateKey(new Date());

export const monthKeyOf = (m: MonthRef) => `${m.year}-${pad(m.month)}`;

export const currentMonth = (): MonthRef => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export const parseMonthParam = (value: string | null): MonthRef | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { year, month };
};

export const shiftMonth = (m: MonthRef, delta: number): MonthRef => {
  const d = new Date(m.year, m.month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

export const monthKeyOfDateKey = (key: string) => key.slice(0, 7);

/** Normalises a backend date/datetime string into a local yyyy-MM-dd key. */
export const dateKeyOf = (value?: string | null): string => {
  if (!value) return '';
  if (value.includes('T') && /(Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value.slice(0, 10) : toDateKey(d);
  }
  return value.slice(0, 10);
};

/** Formats a datetime ("...T07:42:00") or TimeSpan ("07:42:00") as HH:mm. */
export const formatClock = (value?: string | null): string => {
  if (!value) return '--:--';
  if (value.includes('T')) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return value.substring(0, 5);
};

/** Minutes since local midnight of `dayKey` for a datetime string. */
export const minutesFromDayStart = (dayKey: string, value?: string | null): number | null => {
  if (!value) return null;
  const d = new Date(value);
  const base = new Date(`${dayKey}T00:00:00`);
  if (isNaN(d.getTime()) || isNaN(base.getTime())) return null;
  return Math.round((d.getTime() - base.getTime()) / 60000);
};

/** Minutes of a TimeSpan string ("07:30:00"). */
export const timeSpanMinutes = (value?: string | null): number | null => {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

export const formatMinutesClock = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};

export const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAY_LONG = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export const formatLongDate = (key: string) => {
  const d = new Date(`${key}T00:00:00`);
  if (isNaN(d.getTime())) return key;
  return `${WEEKDAY_LONG[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** Monday-first grid covering the whole month (5 or 6 weeks). */
export const buildMonthGrid = (m: MonthRef): { keys: string[]; fromKey: string; toKey: string } => {
  const first = new Date(m.year, m.month - 1, 1);
  const last = new Date(m.year, m.month, 0);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const endOffset = 6 - ((last.getDay() + 6) % 7);
  const start = new Date(m.year, m.month - 1, 1 - startOffset);
  const total = startOffset + last.getDate() + endOffset;
  const keys: string[] = [];
  for (let i = 0; i < total; i++) {
    keys.push(toDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
  }
  return { keys, fromKey: keys[0], toKey: keys[keys.length - 1] };
};

// ============================================================================
// Status model
// ============================================================================

export type EntryTone =
  | 'ontime'
  | 'late'
  | 'absent'
  | 'missingOut'
  | 'unrecorded'
  | 'pending'
  | 'inProgress'
  | 'leave'
  | 'upcoming';

interface ToneMeta {
  label: string;
  icon: string;
  cell: string;
  dot: string;
  badge: string;
  text: string;
}

export const TONE_META: Record<EntryTone, ToneMeta> = {
  ontime: {
    label: 'Đúng giờ',
    icon: 'fa-circle-check',
    cell: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
  },
  late: {
    label: 'Muộn / Về sớm',
    icon: 'fa-clock',
    cell: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'text-amber-700',
  },
  absent: {
    label: 'Vắng mặt',
    icon: 'fa-circle-xmark',
    cell: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    text: 'text-rose-700',
  },
  missingOut: {
    label: 'Thiếu check-out',
    icon: 'fa-right-from-bracket',
    cell: 'bg-violet-50 border-violet-200 hover:border-violet-400',
    dot: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    text: 'text-violet-700',
  },
  unrecorded: {
    label: 'Chưa ghi nhận',
    icon: 'fa-circle-question',
    cell: 'bg-white border-dashed border-rose-300 hover:border-rose-400',
    dot: 'bg-rose-300',
    badge: 'bg-rose-50 text-rose-600 border-rose-200',
    text: 'text-rose-600',
  },
  pending: {
    label: 'Chờ xác nhận',
    icon: 'fa-hourglass-half',
    cell: 'bg-sky-50 border-sky-200 hover:border-sky-400',
    dot: 'bg-sky-500',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    text: 'text-sky-700',
  },
  inProgress: {
    label: 'Đang trong ca',
    icon: 'fa-person-walking',
    cell: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    dot: 'bg-teal-500 animate-pulse',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    text: 'text-teal-700',
  },
  leave: {
    label: 'Nghỉ phép',
    icon: 'fa-umbrella-beach',
    cell: 'bg-slate-100 border-slate-200 hover:border-slate-400',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    text: 'text-slate-500',
  },
  upcoming: {
    label: 'Ca sắp tới',
    icon: 'fa-calendar-day',
    cell: 'bg-white border-blue-200 hover:border-blue-400',
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-700',
  },
};

/** Order used for legend and for picking the "worst" tone of a day. */
const TONE_PRIORITY: EntryTone[] = [
  'absent',
  'missingOut',
  'late',
  'unrecorded',
  'pending',
  'inProgress',
  'ontime',
  'leave',
  'upcoming',
];

export const LEGEND_TONES: EntryTone[] = [
  'ontime',
  'late',
  'absent',
  'missingOut',
  'unrecorded',
  'inProgress',
  'leave',
  'upcoming',
];

/** Backend `TrangThaiChamCong` enum labels. */
export const ATTENDANCE_STATUS_LABEL: Record<string, string> = {
  CHUA_CHAM_CONG: 'Chưa chấm công',
  DI_DUNG_GIO: 'Đúng giờ',
  DI_MUON: 'Đi muộn',
  VE_SOM: 'Về sớm',
  DI_MUON_VE_SOM: 'Đi muộn & về sớm',
  NGHI_PHEP: 'Nghỉ phép',
  VANG_MAT: 'Vắng mặt',
  THIEU_CHECK_OUT: 'Thiếu check-out',
  CHO_XAC_NHAN: 'Chờ xác nhận',
};

// ============================================================================
// Merging schedules + attendances into calendar days
// ============================================================================

export interface DayEntry {
  key: string;
  schedule?: ScheduleItemDto;
  attendance?: AttendanceItemDto;
  shiftName: string;
  shiftStart?: string; // TimeSpan "HH:mm:ss"
  shiftEnd?: string;
  tone: EntryTone;
}

export interface CalendarDay {
  key: string;
  dayOfMonth: number;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  entries: DayEntry[];
  tone: EntryTone | null;
}

const isLeaveSchedule = (s: ScheduleItemDto) => s.trangThai === 'NGHI_PHEP' || s.laNghiTheoNgay;

const toneFromAttendance = (a: AttendanceItemDto, dayKey: string, today: string): EntryTone => {
  const hasIn = !!a.checkIn;
  const hasOut = !!a.checkOut;

  switch (a.trangThai) {
    case 'VANG_MAT':
      return 'absent';
    case 'NGHI_PHEP':
      return 'leave';
    case 'THIEU_CHECK_OUT':
      return 'missingOut';
    case 'CHO_XAC_NHAN':
      return 'pending';
  }

  if (hasIn && !hasOut) {
    if (dayKey >= today) return 'inProgress';
    return 'missingOut';
  }

  switch (a.trangThai) {
    case 'DI_DUNG_GIO':
      return 'ontime';
    case 'DI_MUON':
    case 'VE_SOM':
    case 'DI_MUON_VE_SOM':
      return 'late';
    case 'CHUA_CHAM_CONG':
      return dayKey >= today ? 'upcoming' : 'unrecorded';
    default:
      if ((a.phutDiMuon ?? 0) > 0 || (a.phutVeSom ?? 0) > 0) return 'late';
      return hasIn ? 'ontime' : 'unrecorded';
  }
};

const sortEntries = (a: DayEntry, b: DayEntry) =>
  (timeSpanMinutes(a.shiftStart) ?? 0) - (timeSpanMinutes(b.shiftStart) ?? 0);

export const buildCalendarDays = (
  gridKeys: string[],
  month: MonthRef,
  schedules: ScheduleItemDto[],
  attendances: AttendanceItemDto[],
  today: string,
): CalendarDay[] => {
  const scheduleById = new Map<number, ScheduleItemDto>();
  const schedulesByDay = new Map<string, ScheduleItemDto[]>();
  for (const s of schedules) {
    scheduleById.set(s.id, s);
    const key = dateKeyOf(s.ngayLam);
    const list = schedulesByDay.get(key) ?? [];
    list.push(s);
    schedulesByDay.set(key, list);
  }

  const entriesByDay = new Map<string, DayEntry[]>();
  const usedScheduleIds = new Set<number>();
  const pushEntry = (entry: DayEntry) => {
    const list = entriesByDay.get(entry.key) ?? [];
    list.push(entry);
    entriesByDay.set(entry.key, list);
  };

  for (const a of attendances) {
    const key = dateKeyOf(a.ngayChamCong);
    const schedule = a.maLichLamViec ? scheduleById.get(a.maLichLamViec) : undefined;
    if (schedule) usedScheduleIds.add(schedule.id);
    pushEntry({
      key,
      schedule,
      attendance: a,
      shiftName: a.tenCa || schedule?.tenCa || 'Ca làm việc',
      shiftStart: a.thoiGianBatDau || schedule?.thoiGianBatDau,
      shiftEnd: a.thoiGianKetThuc || schedule?.thoiGianKetThuc,
      tone: toneFromAttendance(a, key, today),
    });
  }

  for (const [key, list] of schedulesByDay) {
    for (const s of list) {
      if (usedScheduleIds.has(s.id)) continue;
      let tone: EntryTone;
      if (isLeaveSchedule(s)) tone = 'leave';
      else if (key >= today) tone = 'upcoming';
      else tone = 'unrecorded';
      pushEntry({
        key,
        schedule: s,
        shiftName: s.tenCa || 'Ca làm việc',
        shiftStart: s.thoiGianBatDau,
        shiftEnd: s.thoiGianKetThuc,
        tone,
      });
    }
  }

  const monthPrefix = monthKeyOf(month);
  return gridKeys.map((key) => {
    const entries = (entriesByDay.get(key) ?? []).sort(sortEntries);
    const tone = entries.length
      ? TONE_PRIORITY.find((t) => entries.some((e) => e.tone === t)) ?? null
      : null;
    return {
      key,
      dayOfMonth: Number(key.slice(8, 10)),
      inMonth: key.startsWith(monthPrefix),
      isToday: key === today,
      isPast: key < today,
      entries,
      tone,
    };
  });
};

// ============================================================================
// Monthly summary
// ============================================================================

export interface MonthSummary {
  workedDays: number;
  scheduledDays: number;
  lateCount: number;
  lateMinutes: number;
  earlyCount: number;
  earlyMinutes: number;
  absentCount: number;
  missingOutCount: number;
  unrecordedCount: number;
  totalHours: number;
}

/** Summary of days inside the month up to (and including) today. */
export const computeMonthSummary = (days: CalendarDay[]): MonthSummary => {
  const summary: MonthSummary = {
    workedDays: 0,
    scheduledDays: 0,
    lateCount: 0,
    lateMinutes: 0,
    earlyCount: 0,
    earlyMinutes: 0,
    absentCount: 0,
    missingOutCount: 0,
    unrecordedCount: 0,
    totalHours: 0,
  };

  for (const day of days) {
    if (!day.inMonth || (!day.isPast && !day.isToday)) continue;
    const workingEntries = day.entries.filter((e) => e.tone !== 'leave');
    if (workingEntries.some((e) => e.schedule || e.attendance)) summary.scheduledDays += 1;
    if (day.entries.some((e) => !!e.attendance?.checkIn)) summary.workedDays += 1;

    for (const e of day.entries) {
      const a = e.attendance;
      if (e.tone === 'absent') summary.absentCount += 1;
      if (e.tone === 'missingOut') summary.missingOutCount += 1;
      if (e.tone === 'unrecorded') summary.unrecordedCount += 1;
      if (!a) continue;
      const late = a.phutDiMuon ?? 0;
      const early = a.phutVeSom ?? 0;
      if (late > 0) {
        summary.lateCount += 1;
        summary.lateMinutes += late;
      }
      if (early > 0) {
        summary.earlyCount += 1;
        summary.earlyMinutes += early;
      }
      summary.totalHours += Number(a.gioLamThucTe ?? 0);
    }
  }

  summary.totalHours = Math.round(summary.totalHours * 10) / 10;
  return summary;
};

// ============================================================================
// Quick filters
// ============================================================================

export type CalendarFilter = 'all' | 'late' | 'absent' | 'missingOut';

export const FILTER_OPTIONS: { value: CalendarFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'late', label: 'Muộn / Sớm' },
  { value: 'absent', label: 'Vắng' },
  { value: 'missingOut', label: 'Thiếu check-out' },
];

export const dayMatchesFilter = (day: CalendarDay, filter: CalendarFilter) => {
  if (filter === 'all') return true;
  if (filter === 'absent') return day.entries.some((e) => e.tone === 'absent' || e.tone === 'unrecorded');
  return day.entries.some((e) => e.tone === filter);
};
