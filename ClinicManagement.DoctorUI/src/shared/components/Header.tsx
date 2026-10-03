import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/components/Header.css';
import ChangePasswordModal from '../../Auth/components/ChangePasswordModal';
import { useAuth } from '../../Auth/context/AuthProvider';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'BS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const navItems = [
    { path: '/overview', label: 'Tổng quan', icon: 'fa-gauge-high' },
    { path: '/queue', label: 'Hàng đợi khám', icon: 'fa-list-ol' },
    { path: '/appointments', label: 'Lịch hẹn', icon: 'fa-calendar-days' },
    { path: '/exam', label: 'Khám bệnh', icon: 'fa-stethoscope' },
    { path: '/schedule', label: 'Lịch & Chấm công', icon: 'fa-calendar-check' },
    { path: '/payslips', label: 'Bảng lương', icon: 'fa-file-invoice-dollar' },
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
        <div 
          className="user-menu" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div className="avatar">{getInitials(user?.fullName)}</div>
          <span>{user?.fullName || 'Bác sĩ'}</span>
          <i className="fa-solid fa-chevron-down"></i>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div 
                className="dropdown-item" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                  setIsChangePasswordOpen(true);
                }}
              >
                <i className="fa-solid fa-key" style={{ color: 'var(--text)' }}></i> Đổi mật khẩu
              </div>
              <div 
                className="dropdown-item" 
                style={{ color: 'var(--danger)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
              >
                <i className="fa-solid fa-right-from-bracket" style={{ color: 'var(--danger)' }}></i> Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </header>
  );
};

export default Header;