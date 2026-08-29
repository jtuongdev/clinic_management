import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useExamination } from '../hook/useExamination';
import '../components/style/Examination.css';

type TabKey =
  | 'overview'
  | 'department'
  | 'patients'
  | 'list'
  | 'cls'
  | 'pharmacy'
  | 'finance'
  | 'hr'
  | 'facility'
  | 'reports';

const ExaminationManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    coSos,
    khoas,
    fetchCoSos,
    fetchKhoas,
    fetchThongKe,
    setFilters,
    filters,
  } = useExamination();

  const [selectedCoSo, setSelectedCoSo] = useState<number | undefined>(undefined);
  const [selectedKhoa, setSelectedKhoa] = useState<number | undefined>(undefined);

  // Load danh sách cơ sở khi component mount
  useEffect(() => {
    fetchCoSos();
  }, []);

  // Khi chọn cơ sở, load danh sách khoa tương ứng và cập nhật filter
  const handleCoSoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const maCoSo = Number(e.target.value);
    setSelectedCoSo(maCoSo);
    if (maCoSo > 0) {
      fetchKhoas(maCoSo);
    } else {
      setSelectedKhoa(undefined);
    }
    setFilters({ maCoSo: maCoSo > 0 ? maCoSo : undefined, maKhoa: selectedKhoa });
  };

  // Khi chọn khoa, cập nhật filter và gọi thống kê
  const handleKhoaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const maKhoa = Number(e.target.value);
    setSelectedKhoa(maKhoa);
    setFilters({ maCoSo: selectedCoSo, maKhoa: maKhoa > 0 ? maKhoa : undefined });
  };

  // Khi filters thay đổi, gọi API thống kê
  useEffect(() => {
    fetchThongKe();
  }, [filters]);

  const getActiveTab = (): TabKey => {
    const path = location.pathname;
    if (path.includes('/examination/overview')) return 'overview';
    if (path.includes('/examination/department')) return 'department';
    if (path.includes('/examination/patients')) return 'patients';
    if (path.includes('/examination/list')) return 'list';
    if (path.includes('/examination/cls')) return 'cls';
    if (path.includes('/examination/pharmacy')) return 'pharmacy';
    if (path.includes('/examination/finance')) return 'finance';
    if (path.includes('/examination/hr')) return 'hr';
    if (path.includes('/examination/facility')) return 'facility';
    if (path.includes('/examination/reports')) return 'reports';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getActiveTab);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const tabs: { key: TabKey; label: string; icon: string; path: string }[] = [
    { key: 'overview', label: 'Tổng quan', icon: 'fa-solid fa-gauge-high', path: '/examination/overview' },
    { key: 'department', label: 'Khoa', icon: 'fa-solid fa-building', path: '/examination/department' },
    { key: 'patients', label: 'Bệnh nhân', icon: 'fa-solid fa-users', path: '/examination/patients' },
    { key: 'list', label: 'Khám bệnh', icon: 'fa-solid fa-stethoscope', path: '/examination/list' },
    { key: 'cls', label: 'CLS', icon: 'fa-solid fa-flask', path: '/examination/cls' },
    { key: 'pharmacy', label: 'Dược', icon: 'fa-solid fa-pills', path: '/examination/pharmacy' },
    { key: 'finance', label: 'Tài chính', icon: 'fa-solid fa-coins', path: '/examination/finance' },
    { key: 'hr', label: 'Nhân sự', icon: 'fa-solid fa-user-doctor', path: '/examination/hr' },
    { key: 'facility', label: 'Cơ sở & Phòng', icon: 'fa-solid fa-door-open', path: '/examination/facility' },
    { key: 'reports', label: 'Báo cáo', icon: 'fa-solid fa-chart-simple', path: '/examination/reports' },
  ];

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="examination-module">
      <div className="context-bar">
        <span className="context-label">Phạm vi</span>
        <select className="context-select" value={selectedCoSo || ''} onChange={handleCoSoChange}>
          <option value="">-- Chọn cơ sở --</option>
          {coSos.map((cs) => (
            <option key={cs.id} value={cs.id}>
              {cs.ten}
            </option>
          ))}
        </select>
        <select className="context-select" value={selectedKhoa || ''} onChange={handleKhoaChange}>
          <option value="">Tất cả khoa</option>
          {khoas.map((k) => (
            <option key={k.id} value={k.id}>
              {k.ten}
            </option>
          ))}
        </select>
        <select className="context-select">
          <option>24/08/2026</option>
          <option>23/08/2026</option>
          <option>22/08/2026</option>
        </select>
        <select className="context-select">
          <option>07:00 — 17:00</option>
          <option>13:00 — 21:00</option>
        </select>
        <div className="context-spacer" />
        <div className="context-info">
          <i className="fa-solid fa-circle-check" />
          Cập nhật 08:45:12
        </div>
        <button className="context-btn" onClick={() => alert('Đã làm mới dữ liệu')}>
          <i className="fa-solid fa-rotate" /> Làm mới
        </button>
      </div>

      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.path)}
          >
            <i className={tab.icon} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ExaminationManagement;