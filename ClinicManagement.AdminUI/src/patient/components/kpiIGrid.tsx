import React from 'react';
import { Skeleton } from 'antd';
import {
  TeamOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import type { ThongKeBenhNhan } from '../type/count.patient.type';

const kpiGridStyles = `
.patient-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  width: 100%;
}
.patient-kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
  min-width: 0;
}
.patient-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}
.patient-kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.patient-kpi-info {
  min-width: 0;
  flex: 1;
}
.patient-kpi-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.patient-kpi-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}
@media (max-width: 768px) {
  .patient-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .patient-kpi-card {
    padding: 10px 14px;
    gap: 10px;
  }
  .patient-kpi-icon {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }
  .patient-kpi-label {
    font-size: 11px;
  }
  .patient-kpi-value {
    font-size: 18px;
  }
}
@media (max-width: 480px) {
  .patient-kpi-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
`;

interface KPIGridProps {
  stats?: ThongKeBenhNhan | null;
  loading?: boolean;
}

interface KPIConfig {
  key: keyof ThongKeBenhNhan;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const kpiConfigs: KPIConfig[] = [
  {
    key: 'tongBenhNhan',
    label: 'Tổng bệnh nhân',
    icon: <TeamOutlined />,
    color: '#2563eb',
    bgColor: '#eff6ff',
  },
  {
    key: 'dangKham',
    label: 'Đang khám',
    icon: <MedicineBoxOutlined />,
    color: '#0284c7',
    bgColor: '#e0f2fe',
  },
  {
    key: 'choKham',
    label: 'Chờ khám',
    icon: <ClockCircleOutlined />,
    color: '#d97706',
    bgColor: '#fef3c7',
  },
  {
    key: 'daHoanThanh',
    label: 'Hoàn thành',
    icon: <CheckCircleOutlined />,
    color: '#16a34a',
    bgColor: '#dcfce7',
  },
  {
    key: 'daHuy',
    label: 'Đã hủy',
    icon: <CloseCircleOutlined />,
    color: '#dc2626',
    bgColor: '#fee2e2',
  },
];

export const KPIGrid: React.FC<KPIGridProps> = ({ stats, loading = false }) => {
  const getValue = (key: keyof ThongKeBenhNhan): number => {
    if (!stats) return 0;
    const pascalKey = (key.charAt(0).toUpperCase() + key.slice(1)) as keyof ThongKeBenhNhan;
    const rawVal = (stats as any)?.[key] ?? (stats as any)?.[pascalKey];
    return typeof rawVal === 'number' ? rawVal : Number(rawVal || 0);
  };

  return (
    <>
      <style>{kpiGridStyles}</style>
      <div className="patient-kpi-grid">
        {kpiConfigs.map((kpi) => (
          <div key={kpi.key} className="patient-kpi-card">
            <div
              className="patient-kpi-icon"
              style={{
                color: kpi.color,
                background: kpi.bgColor,
              }}
            >
              {kpi.icon}
            </div>
            <div className="patient-kpi-info">
              <div className="patient-kpi-label">{kpi.label}</div>
              {loading ? (
                <Skeleton.Input active size="small" style={{ width: 60, height: 22 }} />
              ) : (
                <div className="patient-kpi-value" style={{ color: kpi.color }}>
                  {getValue(kpi.key).toLocaleString('vi-VN')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
