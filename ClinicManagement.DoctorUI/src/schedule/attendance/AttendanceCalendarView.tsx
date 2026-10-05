import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CalendarDayCell from './CalendarDayCell';
import DayDetailPanel from './DayDetailPanel';
import { useMonthlyAttendance } from './useMonthlyAttendance';
import './AttendanceCalendar.css';
import {
  FILTER_OPTIONS,
  LEGEND_TONES,
  TONE_META,
  WEEKDAY_SHORT,
  buildCalendarDays,
  buildMonthGrid,
  computeMonthSummary,
  currentMonth,
  dayMatchesFilter,
  monthKeyOf,
  monthKeyOfDateKey,
  parseMonthParam,
  shiftMonth,
  todayKey,
  type CalendarDay,
  type CalendarFilter,
  type MonthRef,
} from './attendanceCalendar.utils';

interface AttendanceCalendarViewProps {
  refreshSignal: number;
}

// ----------------------------------------------------------------------------
// Summary Card
// ----------------------------------------------------------------------------
interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, hint }) => (
  <div className="att-summary-card">
    <div className="card-label">{label}</div>
    <div className="card-value">{value}</div>
    {hint && <div className="card-hint">{hint}</div>}
  </div>
);

// ----------------------------------------------------------------------------
// Main Attendance Calendar View
// ----------------------------------------------------------------------------
export const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({ refreshSignal }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const month: MonthRef = useMemo(
    () => parseMonthParam(searchParams.get('month')) ?? currentMonth(),
    [searchParams],
  );
  const monthKey = monthKeyOf(month);
  const today = todayKey();
  const isCurrentMonth = monthKey === monthKeyOfDateKey(today);

  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    monthKeyOfDateKey(today) === monthKey ? today : null,
  );

  const { data, loading, error, reload } = useMonthlyAttendance(month, refreshSignal);

  const setMonth = useCallback(
    (next: MonthRef, selectKey?: string | null) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set('tab', 'attendance');
          params.set('month', monthKeyOf(next));
          return params;
        },
        { replace: true },
      );
      if (selectKey !== undefined) {
        setSelectedKey(selectKey);
      } else {
        const t = todayKey();
        setSelectedKey(monthKeyOfDateKey(t) === monthKeyOf(next) ? t : null);
      }
    },
    [setSearchParams],
  );

  const grid = useMemo(() => buildMonthGrid(month), [month]);

  const days = useMemo<CalendarDay[]>(
    () => buildCalendarDays(grid.keys, month, data?.schedules ?? [], data?.attendances ?? [], today),
    [grid, month, data, today],
  );

  const summary = useMemo(() => computeMonthSummary(days), [days]);
  const selectedDay = useMemo(() => days.find((d) => d.key === selectedKey) ?? null, [days, selectedKey]);
  const hasAnyEntry = useMemo(() => days.some((d) => d.inMonth && d.entries.length > 0), [days]);

  const handleSelect = useCallback(
    (day: CalendarDay) => {
      if (!day.inMonth) {
        const target = parseMonthParam(monthKeyOfDateKey(day.key));
        if (target) setMonth(target, day.key);
        return;
      }
      setSelectedKey(day.key);
    },
    [setMonth],
  );

  const monthLabel = `Tháng ${month.month}/${month.year}`;

  return (
    <div className="attendance-calendar-root">
      {/* 1. Top KPI Summary Cards */}
      <section aria-label="Tổng kết tháng" className="att-summary-row">
        <SummaryCard
          label="Ngày công"
          value={
            <>
              {summary.workedDays}
              <span className="unit">/{summary.scheduledDays}</span>
            </>
          }
          hint={isCurrentMonth ? 'Tính đến hôm nay' : 'Số ngày có lịch'}
        />
        <SummaryCard
          label="Đi muộn"
          value={
            <>
              {summary.lateCount}
              <span className="unit">lần</span>
            </>
          }
          hint={`Tổng ${summary.lateMinutes} phút`}
        />
        <SummaryCard
          label="Tổng phút muộn"
          value={
            <>
              {summary.lateMinutes}
              <span className="unit">phút</span>
            </>
          }
          hint="Thời gian vào trễ"
        />
        <SummaryCard
          label="Quên chấm ra"
          value={
            <>
              {summary.missingOutCount}
              <span className="unit">ca</span>
            </>
          }
          hint="Thiếu checkout"
        />
        <SummaryCard
          label="Vắng mặt"
          value={
            <>
              {summary.absentCount}
              <span className="unit">ca</span>
            </>
          }
          hint={summary.unrecordedCount > 0 ? `+${summary.unrecordedCount} chưa ghi nhận` : 'Không có công'}
        />
        <SummaryCard
          label="Tổng giờ làm"
          value={
            <>
              {summary.totalHours}
              <span className="unit">h</span>
            </>
          }
          hint="Thời gian làm thực tế"
        />
      </section>

      {/* 2. Navigation & Filter Toolbar */}
      <div className="att-toolbar-row">
        <div className="att-month-controls">
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, -1))}
            className="att-nav-btn"
            aria-label="Tháng trước"
            title="Tháng trước"
          >
            <i className="fa-solid fa-chevron-left text-xs" />
          </button>

          <div className="att-month-title-wrapper" title="Bấm để chọn tháng/năm">
            <span className="att-month-title">
              {monthLabel}
              <i className="fa-solid fa-caret-down text-xs" style={{ color: '#94a3b8' }} />
            </span>
            <input
              type="month"
              value={monthKey}
              onChange={(e) => {
                const next = parseMonthParam(e.target.value);
                if (next) setMonth(next);
              }}
              className="att-month-native-input"
              aria-label="Chọn tháng"
            />
          </div>

          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, 1))}
            className="att-nav-btn"
            aria-label="Tháng sau"
            title="Tháng sau"
          >
            <i className="fa-solid fa-chevron-right text-xs" />
          </button>

          <button
            type="button"
            onClick={() => setMonth(currentMonth())}
            disabled={isCurrentMonth && selectedKey === today}
            className="att-btn-today"
          >
            Hôm nay
          </button>

          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="att-nav-btn"
            aria-label="Tải lại dữ liệu"
            title="Tải lại tháng này"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs ${loading ? 'fa-spin' : ''}`} />
          </button>
        </div>

        {/* Filter chips as per mockup */}
        <div className="att-filter-chips" role="group" aria-label="Lọc trạng thái">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`att-chip-btn ${filter === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#b91c1c', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <i className="fa-solid fa-triangle-exclamation mr-1.5" />
            {error}
          </span>
          <button type="button" onClick={reload} style={{ fontWeight: 'bold', textDecoration: 'underline', background: 'none', border: 'none', color: '#b91c1c' }}>
            Thử lại
          </button>
        </div>
      )}

      {/* 3. Main Workspace: Calendar Card + Detail Panel */}
      <div className="att-workspace-layout">
        <div className="att-calendar-card">
          <div className="att-weekday-header">
            {WEEKDAY_SHORT.map((w, i) => (
              <div
                key={w}
                className={`att-weekday-cell ${i >= 5 ? 'weekend' : ''}`}
              >
                {w}
              </div>
            ))}
          </div>

          <div
            className="att-days-grid"
            style={{
              gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(0, 1fr))`,
            }}
            role="grid"
            aria-label={`Lịch chấm công ${monthLabel}`}
          >
            {days.map((day) => (
              <CalendarDayCell
                key={day.key}
                day={day}
                selected={day.key === selectedKey}
                dimmed={!dayMatchesFilter(day, filter)}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {loading && !data && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin mr-2" /> Đang tải dữ liệu chấm công...
            </div>
          )}

          {!loading && data && !hasAnyEntry && (
            <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
              Không có lịch làm việc hay chấm công nào trong {monthLabel.toLowerCase()}.
            </p>
          )}

          {/* Legend */}
          <div className="att-legend-bar" aria-label="Chú thích màu">
            {LEGEND_TONES.map((tone) => (
              <div key={tone} className="att-legend-item">
                <span className={`att-status-dot dot-${tone}`} />
                <span>{TONE_META[tone].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Panel */}
        <DayDetailPanel day={selectedDay} onClose={() => setSelectedKey(null)} />
      </div>
    </div>
  );
};

export default AttendanceCalendarView;
