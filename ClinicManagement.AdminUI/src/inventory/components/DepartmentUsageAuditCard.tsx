import React, { useState, useMemo } from 'react';
import type { DepartmentUsageStatDto } from '../types/inventory.types';

interface Props {
  stats: DepartmentUsageStatDto[];
  tuNgay: string;
  denNgay: string;
  loading?: boolean;
}

const BADGE_COLORS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#4f46e5'];

export const DepartmentUsageAuditCard: React.FC<Props> = ({ stats, tuNgay, denNgay, loading }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Tính tổng hợp nhanh khi thu gọn
  const totals = useMemo(() => {
    return stats.reduce(
      (acc, s) => {
        acc.tongXuat += s.tongSoLuong || 0;
        acc.tongMatHang = Math.max(acc.tongMatHang, s.tongMatHang || 0);
        acc.tongLuotKham += s.tongLuotKham || 0;
        acc.tongChiDinh += s.tongChiDinh || 0;
        return acc;
      },
      { tongXuat: 0, tongMatHang: 0, tongLuotKham: 0, tongChiDinh: 0 }
    );
  }, [stats]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <span style={styles.headerIcon}>📊</span>
            <span style={styles.headerTitle}>ĐỐI CHIẾU TIÊU HAO VẬT TƯ THEO KHOA / PHÒNG</span>
            <span style={styles.periodBadge}>{tuNgay} – {denNgay}</span>
          </div>
          <span style={styles.loadingText}>Đang tổng hợp dữ liệu đối soát...</span>
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <span style={styles.headerIcon}>📊</span>
            <span style={styles.headerTitle}>ĐỐI CHIẾU TIÊU HAO VẬT TƯ THEO KHOA / PHÒNG</span>
            <span style={styles.periodBadge}>{tuNgay} – {denNgay}</span>
          </div>
          <span style={styles.emptyText}>Chưa có dữ liệu tiêu hao trong kỳ lọc</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <span style={styles.headerIcon}>📊</span>
          <span style={styles.headerTitle}>ĐỐI CHIẾU TIÊU HAO VẬT TƯ THEO KHOA / PHÒNG</span>
          <span style={styles.periodBadge}>{tuNgay} – {denNgay}</span>
          <span style={styles.deptCountBadge}>{stats.length} Khoa/Phòng</span>

          {collapsed && (
            <div style={styles.compactSummary}>
              <span style={styles.summaryItem}>
                Tổng xuất: <strong style={{ color: '#1e40af' }}>{totals.tongXuat.toLocaleString()}</strong> VT
              </span>
              <span style={styles.summaryDot}>•</span>
              <span style={styles.summaryItem}>
                Lượt khám: <strong>{totals.tongLuotKham.toLocaleString()}</strong>
              </span>
              <span style={styles.summaryDot}>•</span>
              <span style={styles.summaryItem}>
                Chỉ định: <strong>{totals.tongChiDinh.toLocaleString()}</strong>
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(prev => !prev)}
          style={styles.toggleBtn}
          title={collapsed ? 'Mở rộng khối thống kê' : 'Thu gọn khối thống kê để mở rộng không gian bảng'}
        >
          {collapsed ? (
            <>
              <span>Mở rộng</span>
              <span style={{ fontSize: 11 }}>▼</span>
            </>
          ) : (
            <>
              <span>Thu gọn</span>
              <span style={{ fontSize: 11 }}>▲</span>
            </>
          )}
        </button>
      </div>

      {!collapsed && (
        <div style={styles.scrollStrip}>
          {stats.map((stat, idx) => {
            const color = BADGE_COLORS[idx % BADGE_COLORS.length];
            const avgPerVisit = stat.tongLuotKham > 0 ? (stat.tongSoLuong / stat.tongLuotKham).toFixed(1) : null;

            return (
              <div key={stat.maKhoa ?? idx} style={{ ...styles.card, borderTopColor: color }}>
                <div style={styles.cardHeader}>
                  <span style={{ ...styles.deptBadge, backgroundColor: color }}>
                    {stat.maKhoaCode || `K${idx + 1}`}
                  </span>
                  <span style={styles.deptName} title={stat.tenKhoa}>{stat.tenKhoa}</span>
                </div>

                <div style={styles.metricsGrid}>
                  <div style={styles.metricCell}>
                    <span style={styles.metricVal}>{stat.tongSoLuong.toLocaleString()}</span>
                    <span style={styles.metricLbl}>Vật tư xuất</span>
                  </div>
                  <div style={styles.cellDivider} />
                  <div style={styles.metricCell}>
                    <span style={styles.metricVal}>{stat.tongMatHang}</span>
                    <span style={styles.metricLbl}>Loại MH</span>
                  </div>
                  <div style={styles.cellDivider} />
                  <div style={styles.metricCell}>
                    <span style={styles.metricVal}>{stat.tongLuotKham.toLocaleString()}</span>
                    <span style={styles.metricLbl}>Lượt khám</span>
                  </div>
                  <div style={styles.cellDivider} />
                  <div style={styles.metricCell}>
                    <span style={styles.metricVal}>{stat.tongChiDinh.toLocaleString()}</span>
                    <span style={styles.metricLbl}>Chỉ định DV</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  {avgPerVisit ? (
                    <span>
                      TB: <strong style={{ color: '#0f172a' }}>{avgPerVisit}</strong> VT/khám ({stat.tongPhieu} phiếu)
                    </span>
                  ) : (
                    <span>{stat.tongPhieu} phiếu xuất</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 12px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerIcon: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '0.02em',
  },
  periodBadge: {
    fontSize: 11,
    color: '#475569',
    background: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid #e2e8f0',
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  },
  deptCountBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1d4ed8',
    background: '#eff6ff',
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid #bfdbfe',
  },
  compactSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: '#334155',
    marginLeft: 6,
    paddingLeft: 8,
    borderLeft: '2px solid #cbd5e1',
  },
  summaryItem: {
    whiteSpace: 'nowrap',
  },
  summaryDot: {
    color: '#94a3b8',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    padding: '3px 8px',
    fontSize: 11,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  loadingText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  scrollStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: 8,
    width: '100%',
    marginTop: 8,
    boxSizing: 'border-box',
  },
  card: {
    minWidth: 0,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderTopWidth: 3,
    borderTopStyle: 'solid',
    borderRadius: 6,
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxSizing: 'border-box',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  deptBadge: {
    padding: '1px 5px',
    borderRadius: 3,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    flexShrink: 0,
  },
  deptName: {
    fontSize: 11.5,
    fontWeight: 700,
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  metricsGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    padding: '4px 6px',
  },
  metricCell: {
    flex: 1,
    textAlign: 'center',
    minWidth: 0,
  },
  metricVal: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    lineHeight: 1.15,
  },
  metricLbl: {
    fontSize: 9.5,
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cellDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#e2e8f0',
    flexShrink: 0,
  },
  cardFooter: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'right',
  },
};
