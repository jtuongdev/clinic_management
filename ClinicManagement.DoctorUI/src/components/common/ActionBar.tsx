import React, { useEffect, useRef } from 'react';
import './ActionBar.css'; // CSS bên dưới

export interface ActionItem {
  label: string;
  icon: string; // tên icon Font Awesome, không prefix
  onClick: (id: number | string) => void;
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary';
  disabled?: boolean;
}

interface ActionBarProps {
  isVisible: boolean;
  onClose: () => void;
  selectedId?: number | string | null;
  actions?: ActionItem[];
  title?: string;
  entityName?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({
  isVisible,
  onClose,
  selectedId,
  actions = [],
  title = 'Đã chọn',
  entityName = 'bản ghi',
}) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !selectedId) return null;

  return (
    <div className="action-bar-overlay">
      <div className="action-bar" ref={barRef}>
        <div className="action-bar-content">
          <div className="action-bar-info">
            <span className="action-bar-selected">
              {title}: <strong>{selectedId}</strong> ({entityName})
            </span>
          </div>
          <div className="action-bar-actions">
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={`action-btn ${action.color || ''}`}
                onClick={() => action.onClick(selectedId)}
                disabled={action.disabled}
              >
                <i className={`fa-solid fa-${action.icon}`}></i>
                {action.label}
              </button>
            ))}
            <button className="action-btn action-close" onClick={onClose}>
              <i className="fa-solid fa-times"></i> Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;