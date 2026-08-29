import { Card, Statistic, Row, Col } from 'antd';

import {
  UserOutlined,
  UserDeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import type { ThongKeBenhNhan } from '../type/count.patient.type';

import './style/kpiGrid.css';

interface KPIGridProps {
  stats: ThongKeBenhNhan;
  loading?: boolean;
}

const kpiConfigs = [
  {
    key: 'tongBenhNhan',
    label: 'Tổng bệnh nhân',
    icon: <UserOutlined />,
    color: '#3b82f6',
  },
  {
    key: 'dangKham',
    label: 'Đang khám',
    icon: <UserDeleteOutlined />,
    color: '#10b981',
  },
  {
    key: 'choKham',
    label: 'Chờ khám',
    icon: <ClockCircleOutlined />,
    color: '#f59e0b',
  },
  {
    key: 'daHoanThanh',
    label: 'Hoàn thành',
    icon: <CheckCircleOutlined />,
    color: '#8b5cf6',
  },
  {
    key: 'daHuy',
    label: 'Đã hủy',
    icon: <CloseCircleOutlined />,
    color: '#ef4444',
  },
];

export const KPIGrid = ({
  stats,
  loading,
}: KPIGridProps) => {

  const getValue = (
    key: keyof ThongKeBenhNhan
  ): number => {
    return stats?.[key] ?? 0;
  };

  return (
    <Row
      gutter={[14, 14]}
      className="kpi-grid"
      wrap
    >
      {kpiConfigs.map((kpi) => (

        <Col
          key={kpi.key}
          xs={24}
          sm={12}
          md={8}
          lg={8}
          xl={0}
          style={{
            display: 'flex',
          }}
        >
          <Card
            size="small"
            loading={loading}
            className="kpi-card"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.04)',
              border:
                '1px solid #e2e8f0',
              transition:
                'all 0.2s ease',
            }}
          >

            <Statistic
              title={
                <span
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  {kpi.label}
                </span>
              }

              value={getValue(
                kpi.key as keyof ThongKeBenhNhan
              )}

              prefix={
                <span
                  style={{
                    marginRight: 6,
                    fontSize: 18,
                    color: kpi.color,
                  }}
                >
                  {kpi.icon}
                </span>
              }

              styles={{
                content: {
                  fontSize: 24,
                  fontWeight: 700,
                  color: kpi.color,
                  lineHeight: 1.2,
                }
              }}
            />

          </Card>
        </Col>

      ))}
    </Row>
  );
};
