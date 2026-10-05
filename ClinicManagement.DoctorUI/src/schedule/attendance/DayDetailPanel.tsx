import React from 'react';
import {
  ATTENDANCE_STATUS_LABEL,
  formatClock,
  formatLongDate,
  formatMinutesClock,
  minutesFromDayStart,
  timeSpanMinutes,
  type CalendarDay,
  type DayEntry,
} from './attendanceCalendar.utils';

const SOURCE_LABEL: Record<string, string> = {
  TU_DONG_THEO_LICH_MAU: 'Lịch mẫu',
  PHAT_SINH_THU_CONG: 'Đột xuất',
  DOI_CA: 'Đổi ca',
};

const shiftIcon = (startMinutes: number | null) => {
  if (startMinutes == null) return 'fa-briefcase-medical';
  if (startMinutes < 11 * 60) return 'fa-sun';
  if (startMinutes < 17 * 60) return 'fa-cloud-sun';
  return 'fa-moon';
};

// ----------------------------------------------------------------------------
// Timeline: planned shift vs actual check-in/out
// ----------------------------------------------------------------------------
const ShiftTimeline: React.FC<{ entry: DayEntry }> = ({ entry }) => {
  const a = entry.attendance;
  const planStart = timeSpanMinutes(entry.shiftStart);
  let planEnd = timeSpanMinutes(entry.shiftEnd);
  if (planStart != null && planEnd != null && planEnd <= planStart) planEnd += 1440;

  const actualIn = minutesFromDayStart(entry.key, a?.checkIn);
  const actualOut = minutesFromDayStart(entry.key, a?.checkOut);

  const points = [planStart, planEnd, actualIn, actualOut].filter((v): v is number => v != null);
  if (points.length < 2) return null;

  const min = Math.floor((Math.min(...points) - 30) / 30) * 30;
  const max = Math.ceil((Math.max(...points) + 30) / 30) * 30;
  const span = Math.max(60, max - min);
  const pct = (v: number) => `${((v - min) / span) * 100}%`;
  const width = (from: number, to: number) => `${(Math.max(0, to - from) / span) * 100}%`;

  const lateFrom = planStart != null && actualIn != null && actualIn > planStart ? planStart : null;

  return (
    <div className="att-timeline-box">
      <div className="att-timeline-time-header">
        <span className="in-time">
          <i className="fa-solid fa-arrow-down mr-1" />
          {a?.checkIn ? formatClock(a.checkIn) : (entry.shiftStart ? entry.shiftStart.substring(0, 5) : '--:--')}
        </span>
        <span className="out-time">
          {a?.checkOut ? formatClock(a.checkOut) : (entry.shiftEnd ? entry.shiftEnd.substring(0, 5) : '--:--')}
          <i className="fa-solid fa-arrow-up ml-1" />
        </span>
      </div>

      <div className="att-timeline-bar-track" title="Thanh tiến độ ca làm việc">
        {actualIn != null && (
          <div
            className="att-timeline-bar-fill"
            style={{
              left: pct(actualIn),
              width: actualOut != null ? width(actualIn, actualOut) : width(actualIn, Math.min(max, actualIn + 60)),
            }}
          />
        )}
        {lateFrom != null && actualIn != null && (
          <div
            className="att-timeline-bar-late"
            style={{ left: pct(lateFrom), width: width(lateFrom, actualIn) }}
            title="Đi muộn"
          />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
        <span>{formatMinutesClock(min)}</span>
        <span>{formatMinutesClock(max)}</span>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Entry card
// ----------------------------------------------------------------------------
const EntryCard: React.FC<{ entry: DayEntry }> = ({ entry }) => {
  const a = entry.attendance;
  const s = entry.schedule;
  const startMin = timeSpanMinutes(entry.shiftStart);
  const statusText = a ? ATTENDANCE_STATUS_LABEL[a.trangThai] ?? 'Đúng giờ' : 'Đúng giờ';
  const location = [s?.tenKhoa, s?.tenPhongKham].filter(Boolean).join(' · ');
  const late = a?.phutDiMuon ?? 0;
  const early = a?.phutVeSom ?? 0;
  const noteText = a?.ghiChu || s?.ghiChu || '';

  const badgeClass =
    entry.tone === 'late'
      ? 'badge-late'
      : entry.tone === 'absent' || entry.tone === 'unrecorded'
      ? 'badge-absent'
      : 'badge-ontime';

  return (
    <article className="att-shift-box">
      <div className="att-shift-header">
        <div className="att-shift-icon-wrap">
          <i className={`fa-solid ${shiftIcon(startMin)}`} />
        </div>
        <div className="att-shift-info" style={{ flex: 1 }}>
          <h4>{entry.shiftName}</h4>
          <div className="shift-time">
            {entry.shiftStart ? entry.shiftStart.substring(0, 5) : '--:--'} – {entry.shiftEnd ? entry.shiftEnd.substring(0, 5) : '--:--'}
          </div>
          {location && <div className="shift-location">{location}</div>}
        </div>
      </div>

      <ShiftTimeline entry={entry} />

      <div style={{ textAlign: 'center' }}>
        <div className={`att-status-pill-center ${badgeClass}`}>
          {late > 0 ? (
            <>
              <i className="fa-solid fa-clock" /> Đi muộn {late} phút
            </>
          ) : early > 0 ? (
            <>
              <i className="fa-solid fa-person-walking-arrow-right" /> Về sớm {early} phút
            </>
          ) : (
            <>
              <i className="fa-solid fa-circle-check" /> {statusText}
            </>
          )}
        </div>
      </div>

      {a && (
        <div className="att-stat-grid">
          <div className="att-stat-item">
            <div className="stat-label">Giờ làm</div>
            <div className="stat-val">{Number(a.gioLamThucTe ?? 0).toFixed(1)}h</div>
          </div>
          <div className="att-stat-item">
            <div className="stat-label">Đi muộn</div>
            <div className={`stat-val ${late > 0 ? 'highlight' : ''}`}>{late}p</div>
          </div>
          <div className="att-stat-item">
            <div className="stat-label">Về sớm</div>
            <div className={`stat-val ${early > 0 ? 'highlight' : ''}`}>{early}p</div>
          </div>
        </div>
      )}

      {/* Note Display */}
      <div className="att-note-box">
        <label>Ghi chú</label>
        <div className="note-content">
          {noteText || <em>Không có ghi chú</em>}
        </div>
      </div>

      {s?.nguonLich && (
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          <strong>Nguồn lịch:</strong> {SOURCE_LABEL[s.nguonLich] ?? s.nguonLich}
        </div>
      )}

      {/* Adjustment action button placeholder as shown in mockup */}
      <button
        type="button"
        className="att-btn-adjustment"
        title="Gửi yêu cầu giải trình / điều chỉnh công"
        onClick={() => {
          alert('Chức năng Yêu cầu điều chỉnh công sẽ khả dụng khi phòng khám mở cổng tiếp nhận.');
        }}
      >
        <i className="fa-solid fa-file-pen" />
        Yêu cầu điều chỉnh
      </button>
    </article>
  );
};

// ----------------------------------------------------------------------------
// Main Panel
// ----------------------------------------------------------------------------
interface DayDetailPanelProps {
  day: CalendarDay | null;
  onClose?: () => void;
}

export const DayDetailPanel: React.FC<DayDetailPanelProps> = ({ day, onClose }) => {
  if (!day) {
    return (
      <div className="att-detail-panel" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#64748b' }}>
        <i className="fa-regular fa-calendar-check" style={{ fontSize: '32px', marginBottom: '8px', color: '#94a3b8' }} />
        <p style={{ fontWeight: 600 }}>Chọn một ngày trên lịch để xem chi tiết chấm công.</p>
      </div>
    );
  }

  return (
    <aside className="att-detail-panel" aria-live="polite">
      <div className="att-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>{formatLongDate(day.key)}</h3>
          <p>
            {day.entries.length > 0 ? `${day.entries.length} ca làm việc` : 'Không có ca làm việc'}
            {day.isToday && (
              <span style={{ marginLeft: '6px', background: '#0d9488', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Hôm nay
              </span>
            )}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="att-nav-btn"
            style={{ width: '28px', height: '28px' }}
            aria-label="Đóng chi tiết"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>

      {day.entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
          <i className="fa-solid fa-mug-hot" style={{ fontSize: '28px', marginBottom: '10px', display: 'block' }} />
          <span>Ngày nghỉ — không có ca trực nào được phân bổ.</span>
        </div>
      ) : (
        day.entries.map((entry, idx) => (
          <EntryCard key={entry.attendance?.id ?? `s-${entry.schedule?.id ?? idx}`} entry={entry} />
        ))
      )}
    </aside>
  );
};

export default DayDetailPanel;
