import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { menuGroups, getSubMenuItems } from '../../../constants/menu.constants';
import { useUIStore } from '../../../stores/ui.store';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, openKeys, mobileOpen, toggleOpenKey, toggleCollapsed, setMobileOpen } = useUIStore();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isSubActive = (items: { path: string }[]) => items.some((item) => isActive(item.path));

  const handleMenuClick = (path: string, key: string) => {
    if (path) {
      navigate(path);
    }
    if (collapsed) {
      toggleCollapsed();
    }
    toggleOpenKey(key);
    if (mobileOpen) setMobileOpen(false);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCollapsed();
  };

  const handleSidebarClick = () => {
    if (collapsed) {
      toggleCollapsed();
    }
  };

  return (
    <div
      onClick={handleSidebarClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        width: collapsed ? 64 : 250,
        background: '#ffffff',
        borderRight: '1px solid #e9edf4',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        height: '100vh',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid #e9edf4',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: '#0b4f6c',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          🏥
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0b2a3c' }}>HIS</div>
            <div style={{ fontSize: 10, color: '#6a7f96', fontWeight: 500 }}>Bệnh viện Đa khoa</div>
          </div>
        )}
        <button
          onClick={handleCollapse}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '1px solid #e9edf4',
            background: '#fff',
            color: '#4a637a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            flexShrink: 0,
            transition: 'all 0.2s',
            ...(collapsed ? { display: 'none' } : {}),
          }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Menu */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0 16px',
        }}
      >
        {menuGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div
                style={{
                  padding: '10px 16px 4px',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  color: '#8a9fb0',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const subItems = getSubMenuItems(item.key);
              const hasSub = subItems.length > 0;
              const isOpen = openKeys.includes(item.key);
              const active = isActive(item.path) || (hasSub && isSubActive(subItems));

              return (
                <div key={item.key}>
                  <div
                    onClick={() => (hasSub ? handleMenuClick(item.path, item.key) : handleItemClick(item.path))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '7px 16px',
                      cursor: 'pointer',
                      color: active ? '#0b4f6c' : '#3d566e',
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      borderLeft: active ? '3px solid #0b4f6c' : '3px solid transparent',
                      background: active ? '#ecf3fa' : 'transparent',
                      transition: 'all 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#f0f4fa';
                        e.currentTarget.style.color = '#0b4f6c';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#3d566e';
                      }
                    }}
                  >
                    <span style={{ width: 18, fontSize: 14, color: active ? '#0b4f6c' : '#6a7f96', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && (
                          <span
                            style={{
                              background: item.badgeColor === 'blue' ? '#0b4f6c' : '#dc3545',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '0 7px',
                              borderRadius: 12,
                              lineHeight: '17px',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        {hasSub && (
                          <span
                            style={{
                              fontSize: 10,
                              color: '#8a9fb0',
                              transition: 'transform 0.15s',
                              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          >
                            <ChevronRight size={14} />
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {!collapsed && hasSub && isOpen && (
                    <div
                      style={{
                        paddingLeft: 38,
                        borderLeft: '1px dashed #dce3ec',
                        marginLeft: 18,
                      }}
                    >
                      {subItems.map((sub) => (
                        <div
                          key={sub.key}
                          onClick={() => handleItemClick(sub.path)}
                          style={{
                            padding: '4px 14px',
                            fontSize: 12,
                            fontWeight: isActive(sub.path) ? 600 : 400,
                            color: isActive(sub.path) ? '#0b4f6c' : '#4a637a',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#0b4f6c';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = isActive(sub.path) ? '#0b4f6c' : '#4a637a';
                          }}
                        >
                          {sub.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid #e9edf4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: collapsed ? 0 : 10,
          fontSize: 12,
          color: '#4a637a',
          flexShrink: 0,
        }}
      >
        {!collapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#0b4f6c',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                BS
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>Bác sĩ Tuấn</div>
                <div style={{ fontSize: 11, color: '#6a7f96' }}>Khoa Nội</div>
              </div>
            </div>
            <LogOut size={16} style={{ cursor: 'pointer', color: '#8a9fb0', flexShrink: 0 }} />
          </>
        ) : (
          <>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: '#0b4f6c',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              BS
            </div>
            <LogOut size={16} style={{ cursor: 'pointer', color: '#8a9fb0', flexShrink: 0, marginLeft: 8 }} />
          </>
        )}
      </div>
    </div>
  );
};