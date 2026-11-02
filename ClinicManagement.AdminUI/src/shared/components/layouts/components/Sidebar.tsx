import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, PanelLeftOpen } from 'lucide-react';
import { menuGroups, getSubMenuItems } from '../../../constants/menu.constants';
import { useUIStore } from '../../../stores/ui.store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlyoutState {
  key: string;
  top: number;
  label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_COLLAPSED_W = 56;
const SIDEBAR_EXPANDED_W  = 248;
const BRAND_COLOR         = '#0b4f6c';
const ACTIVE_BG           = '#eef4fb';
const HOVER_BG            = '#f4f7fb';
const BORDER_COLOR        = '#e5eaf2';

// ─── Styles helpers ───────────────────────────────────────────────────────────

const menuItemBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '7px 0 7px 14px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  borderLeft: '3px solid transparent',
  borderRadius: '0 8px 8px 0',
  marginRight: 8,
  transition: 'background 0.13s, color 0.13s, border-color 0.13s',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Sidebar: React.FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { collapsed, openKeys, mobileOpen, toggleOpenKey, toggleCollapsed, setMobileOpen } =
    useUIStore();

  // Flyout popup state (hover khi collapsed)
  const [flyout, setFlyout] = useState<FlyoutState | null>(null);
  const flyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const isActive = (path: string) => {
    const [pathname, search] = path.split('?');
    return (
      (location.pathname === pathname || location.pathname.startsWith(pathname + '/')) &&
      (!search || location.search === `?${search}`)
    );
  };

  const isSubActive = (items: { path: string }[]) => items.some((i) => isActive(i.path));

  // ── Event handlers ──────────────────────────────────────────────────────────

  /** Click lên menu parent khi expanded */
  const handleMenuClick = (path: string, key: string, hasSub: boolean) => {
    if (!hasSub && path) {
      navigate(path);
    } else {
      if (path) navigate(path);
      toggleOpenKey(key);
    }
    if (mobileOpen) setMobileOpen(false);
  };

  /** Click lên menu item lá */
  const handleItemClick = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
    setFlyout(null);
  };

  /** Toggle collapsed bằng nút */
  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCollapsed();
    setFlyout(null);
  };

  /** Click vào sidebar khi đang collapsed → mở rộng */
  const handleSidebarClick = () => {
    if (collapsed) toggleCollapsed();
  };

  // ── Flyout hover (chỉ khi collapsed) ───────────────────────────────────────

  const clearFlyoutTimer = useCallback(() => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
  }, []);

  const handleIconMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, key: string, label: string) => {
      if (!collapsed) return;
      const subItems = getSubMenuItems(key);
      if (subItems.length === 0) return; // chỉ flyout cho item có submenu

      clearFlyoutTimer();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setFlyout({ key, top: rect.top, label });
    },
    [collapsed, clearFlyoutTimer]
  );

  const handleIconMouseLeave = useCallback(() => {
    if (!collapsed) return;
    flyoutTimerRef.current = setTimeout(() => setFlyout(null), 120);
  }, [collapsed]);

  const handleFlyoutEnter = useCallback(() => {
    clearFlyoutTimer();
  }, [clearFlyoutTimer]);

  const handleFlyoutLeave = useCallback(() => {
    flyoutTimerRef.current = setTimeout(() => setFlyout(null), 120);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Sidebar panel ───────────────────────────────────────────────────── */}
      <div
        onClick={handleSidebarClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          width: collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W,
          background: '#ffffff',
          borderRight: `1px solid ${BORDER_COLOR}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          height: '100vh',
          boxShadow: collapsed ? 'none' : '2px 0 12px rgba(11,79,108,0.06)',
        }}
      >
        {/* ── Brand header ────────────────────────────────────────────────── */}
        <div
          style={{
            padding: collapsed ? '14px 0' : '13px 12px 12px',
            borderBottom: `1px solid ${BORDER_COLOR}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: 10,
            flexShrink: 0,
            minHeight: 56,
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              width: 34,
              height: 34,
              background: BRAND_COLOR,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 17,
              fontWeight: 700,
              flexShrink: 0,
              cursor: collapsed ? 'pointer' : 'default',
            }}
            title={collapsed ? 'Mở rộng sidebar' : undefined}
          >
            🏥
          </div>

          {/* Tên hệ thống (ẩn khi collapsed) */}
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0b2a3c', lineHeight: 1.2 }}>
                HIS
              </div>
              <div style={{ fontSize: 10, color: '#6a7f96', fontWeight: 500, marginTop: 1 }}>
                Bệnh viện Đa khoa
              </div>
            </div>
          )}

          {/* Nút thu nhỏ (chỉ khi expanded) */}
          {!collapsed && (
            <button
              onClick={handleCollapse}
              title="Thu nhỏ sidebar"
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                border: `1px solid ${BORDER_COLOR}`,
                background: '#f8fafc',
                color: '#6a7f96',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e9edf4'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
            >
              <ChevronLeft size={14} />
            </button>
          )}

          {/* Icon mở rộng khi collapsed (nút nhỏ bên dưới logo) */}
          {collapsed && (
            <div
              onClick={(e) => { e.stopPropagation(); toggleCollapsed(); }}
              title="Mở rộng sidebar"
              style={{
                position: 'absolute',
                top: 48,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 20,
                height: 20,
                borderRadius: 4,
                background: '#eef4fb',
                color: BRAND_COLOR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 10,
              }}
            >
              <PanelLeftOpen size={11} />
            </div>
          )}
        </div>

        {/* ── Menu scroll area ─────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '6px 0 12px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#dde3ec transparent',
          }}
        >
          {menuGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {/* Group label (ẩn khi collapsed) */}
              {!collapsed && (
                <div
                  style={{
                    padding: '8px 16px 3px',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    color: '#99afc0',
                    fontWeight: 700,
                    letterSpacing: 0.6,
                  }}
                >
                  {group.label}
                </div>
              )}

              {/* Menu items */}
              {group.items.map((item) => {
                const subItems = getSubMenuItems(item.key);
                const hasSub   = subItems.length > 0;
                const isOpen   = openKeys.includes(item.key);
                const active   = isActive(item.path) || (hasSub && isSubActive(subItems));

                return (
                  <div key={item.key}>
                    {/* ── Parent row ──────────────────────────────────────── */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (collapsed) {
                          // Khi collapsed: click icon → mở sidebar trước
                          toggleCollapsed();
                          if (hasSub) toggleOpenKey(item.key);
                          else if (item.path) navigate(item.path);
                        } else {
                          handleMenuClick(item.path, item.key, hasSub);
                        }
                        setFlyout(null);
                      }}
                      onMouseEnter={(e) =>
                        handleIconMouseEnter(e, item.key, item.label)
                      }
                      onMouseLeave={handleIconMouseLeave}
                      title={collapsed ? item.label : undefined}
                      style={{
                        ...menuItemBase,
                        color: active ? BRAND_COLOR : '#3d566e',
                        fontWeight: active ? 600 : 500,
                        borderLeftColor: active ? BRAND_COLOR : 'transparent',
                        background: active ? ACTIVE_BG : 'transparent',
                        // Căn giữa icon khi thu nhỏ
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '8px 0' : '7px 0 7px 14px',
                        marginRight: collapsed ? 0 : 8,
                        borderRadius: collapsed ? 0 : '0 8px 8px 0',
                      }}
                      onMouseOver={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                          (e.currentTarget as HTMLElement).style.color = BRAND_COLOR;
                        }
                      }}
                      onFocus={() => {}}
                    >
                      {/* Icon */}
                      <span
                        style={{
                          color: active ? BRAND_COLOR : '#7a94a8',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: 17,
                        }}
                      >
                        {item.icon}
                      </span>

                      {/* Label + badge + chevron (ẩn khi collapsed) */}
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>

                          {item.badge && (
                            <span
                              style={{
                                background:
                                  item.badgeColor === 'blue'
                                    ? BRAND_COLOR
                                    : item.badgeColor === 'orange'
                                    ? '#d97706'
                                    : '#dc3545',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 10,
                                lineHeight: '16px',
                                marginRight: 2,
                              }}
                            >
                              {item.badge}
                            </span>
                          )}

                          {hasSub && (
                            <span
                              style={{
                                color: '#9fb0c0',
                                marginRight: 10,
                                transition: 'transform 0.18s',
                                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                display: 'flex',
                              }}
                            >
                              <ChevronRight size={13} />
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* ── Inline submenu (chỉ khi expanded) ──────────────── */}
                    {!collapsed && hasSub && isOpen && (
                      <div
                        style={{
                          paddingLeft: 36,
                          marginLeft: 12,
                          borderLeft: '1px dashed #d4dde8',
                          marginBottom: 4,
                        }}
                      >
                        {subItems.map((sub) => (
                          <div
                            key={sub.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(sub.path);
                            }}
                            style={{
                              padding: '5px 12px 5px 0',
                              fontSize: 12.5,
                              fontWeight: isActive(sub.path) ? 600 : 400,
                              color: isActive(sub.path) ? BRAND_COLOR : '#4f6a80',
                              cursor: 'pointer',
                              borderRadius: 6,
                              transition: 'color 0.12s',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color = BRAND_COLOR;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color = isActive(sub.path)
                                ? BRAND_COLOR
                                : '#4f6a80';
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

        {/* ── Footer: user info ────────────────────────────────────────────── */}
        <div
          style={{
            padding: collapsed ? '10px 0' : '10px 14px',
            borderTop: `1px solid ${BORDER_COLOR}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: BRAND_COLOR,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            BS
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>Bác sĩ Tuấn</div>
                <div style={{ fontSize: 11, color: '#6a7f96' }}>Khoa Nội</div>
              </div>
              <LogOut
                size={15}
                style={{ cursor: 'pointer', color: '#99afc0', flexShrink: 0 }}
                title="Đăng xuất"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Flyout popup (khi collapsed + hover vào item có submenu) ──────────── */}
      {collapsed && flyout && (() => {
        const subItems = getSubMenuItems(flyout.key);
        if (!subItems.length) return null;

        return (
          <div
            onMouseEnter={handleFlyoutEnter}
            onMouseLeave={handleFlyoutLeave}
            style={{
              position: 'fixed',
              top: flyout.top,
              left: SIDEBAR_COLLAPSED_W + 6,
              zIndex: 200,
              background: '#ffffff',
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(11,79,108,0.13)',
              minWidth: 188,
              overflow: 'hidden',
              animation: 'flyoutIn 0.15s ease',
            }}
          >
            {/* Header flyout: tên menu parent */}
            <div
              style={{
                padding: '9px 14px 8px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: '#8ba0b2',
                borderBottom: `1px solid ${BORDER_COLOR}`,
                background: '#f8fafc',
              }}
            >
              {flyout.label}
            </div>

            {/* Submenu items */}
            <div style={{ padding: '4px 0' }}>
              {subItems.map((sub) => {
                const active = isActive(sub.path);
                return (
                  <div
                    key={sub.key}
                    onClick={() => handleItemClick(sub.path)}
                    style={{
                      padding: '7px 16px',
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? BRAND_COLOR : '#2d4a5e',
                      background: active ? ACTIVE_BG : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                      borderLeft: active ? `3px solid ${BRAND_COLOR}` : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {sub.label}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Keyframe animation cho flyout */}
      <style>{`
        @keyframes flyoutIn {
          from { opacity: 0; transform: translateX(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </>
  );
};