import React, { useEffect, useRef } from 'react';
import { Button, Space, Typography } from 'antd';
import {
  EyeOutlined,
  PlayCircleOutlined,
  StopOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  MedicineBoxOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import '../style/ActionBar.css';

const { Text } = Typography;

export interface ActionItem {
  label: string;
  icon?: string | React.ReactNode;
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

const renderIcon = (icon?: string | React.ReactNode) => {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  switch (icon) {
    case 'eye':
      return <EyeOutlined />;
    case 'play':
      return <PlayCircleOutlined />;
    case 'ban':
      return <StopOutlined />;
    case 'pen-to-square':
    case 'edit':
      return <EditOutlined />;
    case 'trash':
      return <DeleteOutlined />;
    case 'check':
      return <CheckOutlined />;
    case 'truck':
      return <MedicineBoxOutlined />;
    default:
      return null;
  }
};

const getButtonProps = (color?: string) => {
  switch (color) {
    case 'primary':
      return { type: 'primary' as const };
    case 'danger':
      return { danger: true, type: 'primary' as const };
    case 'success':
      return {
        type: 'primary' as const,
        style: { background: '#10b981', borderColor: '#10b981', color: '#fff' },
      };
    case 'warning':
      return {
        type: 'primary' as const,
        style: { background: '#f59e0b', borderColor: '#f59e0b', color: '#fff' },
      };
    case 'info':
      return {
        type: 'primary' as const,
        style: { background: '#0284c7', borderColor: '#0284c7', color: '#fff' },
      };
    default:
      return { type: 'default' as const };
  }
};

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
              {title}: <Text strong style={{ color: '#0b4f6c' }}>{selectedId}</Text>{' '}
              <Text type="secondary">({entityName})</Text>
            </span>
          </div>
          <Space className="action-bar-actions" wrap>
            {actions.map((action, idx) => (
              <Button
                key={idx}
                {...getButtonProps(action.color)}
                icon={renderIcon(action.icon)}
                onClick={() => action.onClick(selectedId)}
                disabled={action.disabled}
                size="middle"
              >
                {action.label}
              </Button>
            ))}
            <Button icon={<CloseOutlined />} onClick={onClose} size="middle">
              Đóng
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;