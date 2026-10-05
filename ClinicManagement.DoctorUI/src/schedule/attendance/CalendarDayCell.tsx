import React from 'react';
import {
  TONE_META,
  formatClock,
  type CalendarDay,
  type DayEntry,
} from './attendanceCalendar.utils';

interface CalendarDayCellProps {
  day: CalendarDay;
  selected: boolean;
  dimmed: boolean;
  onSelect: (day: CalendarDay) => void;
}

const formatTimeSpan = (value?: string) => (value ? value.substring(0, 5) : '--:--');

const entryHint = (entry: DayEntry): string => {
  const a = entry.attendance;
  switch (entry.tone) {
    case 'late': {
      const parts: string[] = [];
      if ((a?.phutDiMuon ?? 0) > 0) parts.push(`Muộn ${a?.phutDiMuon}p`);
      if ((a?.phutVeSom ?? 0) > 0) parts.push(`Sớm ${a?.phutVeSom}p`);
      return parts.join(' · ') || TONE_META.late.label;
    }
    case 'ontime':
      return a?.gioLamThucTe != null ? `${entry.shiftName} · ${Number(a.gioLamThucTe).toFixed(1)}h` : entry.shiftName;
    case 'upcoming':
      return entry.shiftName;
    default:
      return TONE_META[entry.tone].label;
  }
};

const entryTimeLine = (entry: DayEntry): string => {
  const a = entry.attendance;
  if (a?.checkIn) return `${formatClock(a.checkIn)} → ${a.checkOut ? formatClock(a.checkOut) : '--:--'}`;
  if (entry.shiftStart || entry.shiftEnd) return `${formatTimeSpan(entry.shiftStart)} – ${formatTimeSpan(entry.shiftEnd)}`;
  return '';
};

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ day, selected, dimmed, onSelect }) => {
  const primary = day.entries[0];
  const extra = day.entries.length - 1;

  const toneClass = day.tone ? `tone-${day.tone}` : '';
  const isSelectedClass = selected ? 'selected' : '';
  const isTodayClass = day.isToday ? 'today' : '';
  const isOutsideClass = !day.inMonth ? 'outside-month' : '';
  const isDimmedClass = dimmed ? 'dimmed' : '';

  const ariaLabel = [
    `Ngày ${day.dayOfMonth}`,
    day.tone ? TONE_META[day.tone].label : '',
    primary ? entryTimeLine(primary) : 'Không có lịch',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      aria-pressed={selected}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`att-day-cell ${toneClass} ${isSelectedClass} ${isTodayClass} ${isOutsideClass} ${isDimmedClass}`}
    >
      <div className="att-cell-top">
        <span className={`att-cell-date-num ${day.isToday ? 'is-today' : ''}`}>
          {day.dayOfMonth}
        </span>
        {day.tone && <span className={`att-status-dot dot-${day.tone}`} aria-hidden="true" />}
      </div>

      {primary && (
        <div className="att-cell-body">
          {entryTimeLine(primary) && (
            <span className="att-cell-time">{entryTimeLine(primary)}</span>
          )}
          <span className={`att-cell-badge-text text-${primary.tone}`}>
            {entryHint(primary)}
          </span>
          {extra > 0 && (
            <span className="att-cell-extra-pill">
              +{extra} ca
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default CalendarDayCell;
