import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/components/ContextBar.css';

// Ánh xạ path -> title và icon
const viewConfigs: Record<string, { title: string; icon: string; showMeta: boolean }> = {
  overview: { title: 'Tổng quan', icon: 'fa-gauge-high', showMeta: true },
  queue: { title: 'Hàng đợi khám', icon: 'fa-list-ol', showMeta: true },
  exam: { title: 'Khám bệnh', icon: 'fa-stethoscope', showMeta: false },
  records: { title: 'Bệnh án', icon: 'fa-folder-open', showMeta: false },
  reports: { title: 'Báo cáo', icon: 'fa-chart-column', showMeta: false },
  catalog: { title: 'Danh mục', icon: 'fa-folder-tree', showMeta: false },
  system: { title: 'Hệ thống', icon: 'fa-gear', showMeta: false },
};

const ContextBar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.slice(1) || 'overview';
  const cfg = viewConfigs[path] || viewConfigs.overview;

  return (
    <div className="context-bar">
      <div className="context-title">
        <i className={`fa-solid ${cfg.icon}`}></i> {cfg.title}
      </div>
      <div className="context-divider"></div>
      {cfg.showMeta && (
        <div className="context-meta">
          <span className="meta-item">Ngày: <strong>27/08/2026</strong></span>
          <span className="meta-item">Ca: <strong>Sáng</strong></span>
          <span className="meta-item">Cập nhật: <strong>08:30</strong></span>
        </div>
      )}
    </div>
  );
};

export default ContextBar;