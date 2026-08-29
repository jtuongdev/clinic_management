import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/components/Header.css';

const Header: React.FC = () => {
  const navItems = [
    { path: '/overview', label: 'Tổng quan', icon: 'fa-gauge-high' },
    { path: '/queue', label: 'Hàng đợi khám', icon: 'fa-list-ol' },
    { path: '/exam', label: 'Khám bệnh', icon: 'fa-stethoscope' },
    { path: '/records', label: 'Bệnh án', icon: 'fa-folder-open' },
    { path: '/reports', label: 'Báo cáo', icon: 'fa-chart-column' },
    { path: '/catalog', label: 'Danh mục', icon: 'fa-folder-tree' },
    { path: '/system', label: 'Hệ thống', icon: 'fa-gear' },
  ];

  return (
    <header className="header">
      <div className="header-main">
        <div className="brand">
          <div className="brand-mark"><i className="fa-solid fa-house-medical"></i></div>
          <span>CLINIC MANAGEMENT</span>
        </div>
        <nav className="nav">
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <i className={`fa-solid ${icon}`}></i> {label}
            </NavLink>
          ))}
        </nav>
        <div className="user-menu">
          <div className="avatar">NT</div>
          <span>BS. Nguyễn Văn Tuấn</span>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </div>
    </header>
  );
};

export default Header;