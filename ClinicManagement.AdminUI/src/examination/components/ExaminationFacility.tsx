import React, { useState } from 'react';
import { Card, Row, Col, Tag, Typography, Button, Space, Tooltip, Badge } from 'antd';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  ToolOutlined,
  AlertOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface RoomItem {
  name: string;
  type: string;
  doctor: string;
  patient: string;
  status: 'doing' | 'alert' | 'idle' | string;
}

const mockFacility = {
  kpis: [
    { label: 'Tổng phòng khám', value: '28', color: '#0b4f6c', bgColor: '#e8f4f7', icon: <AppstoreOutlined style={{ fontSize: 20, color: '#0b4f6c' }} /> },
    { label: 'Đang hoạt động', value: '18', color: '#10b981', bgColor: '#ecfdf5', icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Phòng trống', value: '8', color: '#0284c7', bgColor: '#e0f2fe', icon: <ShopOutlined style={{ fontSize: 20, color: '#0284c7' }} /> },
    { label: 'Bảo trì kỹ thuật', value: '2', color: '#f59e0b', bgColor: '#fffbeb', icon: <ToolOutlined style={{ fontSize: 20, color: '#f59e0b' }} /> },
    { label: 'Sự cố thiết bị', value: '1', color: '#ef4444', bgColor: '#fef2f2', icon: <AlertOutlined style={{ fontSize: 20, color: '#ef4444' }} /> },
    { label: 'Bàn khám lâm sàng', value: '5', color: '#8b5cf6', bgColor: '#f3e8ff', icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#8b5cf6' }} /> },
  ],
  rooms: [
    { name: 'P101', type: 'Khoa Nội', doctor: 'BS. Tuấn', patient: 'Nguyễn Văn An', status: 'doing' },
    { name: 'P205', type: 'Khoa Ngoại', doctor: 'BS. Hoa', patient: 'Ngô Thị Hoa', status: 'doing' },
    { name: 'P302', type: 'Khoa Nhi', doctor: 'BS. Minh', patient: 'Lê Văn Cường', status: 'alert' },
    { name: 'P408', type: 'Khoa Sản', doctor: 'BS. Lan', patient: 'Phạm Thị Dung', status: 'doing' },
    { name: 'P510', type: 'Tai Mũi Họng', doctor: 'BS. Hùng', patient: '—', status: 'idle' },
  ] as RoomItem[],
};

const ExaminationFacility: React.FC = () => {
  const [data] = useState(mockFacility);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const renderStatusTag = (status: string) => {
    if (status === 'doing') return <Tag color="processing">Đang khám</Tag>;
    if (status === 'alert') return <Tag color="error">Quá tải / Chờ lâu</Tag>;
    return <Tag color="default">Phòng trống</Tag>;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: '#ffffff',
      }}
    >
      {/* Metric Ribbon / Stat Bar */}
      <div
        style={{
          height: 42,
          minHeight: 42,
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {data.kpis.map((kpi, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>{kpi.icon}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>
                {kpi.value}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Control Toolbar */}
      <div
        style={{
          minHeight: 46,
          padding: '6px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <Space size="middle">
          <Space size="small">
            <ShopOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Sơ đồ trạng thái buồng khám & Thiết bị lâm sàng
            </Text>
          </Space>
          <Badge count={data.rooms.length} style={{ backgroundColor: '#0b4f6c' }} />
        </Space>

        <Tooltip title="Làm mới tình trạng phòng">
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} size="middle">
            Làm mới
          </Button>
        </Tooltip>
      </div>

      {/* Room Grid Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        <Row gutter={[12, 12]}>
          {data.rooms.map((room, idx) => {
            const isDoing = room.status === 'doing';
            const isAlert = room.status === 'alert';
            const borderCol = isAlert ? '#ffccc7' : isDoing ? '#bae0ff' : '#e2e8f0';
            const topBarCol = isAlert ? '#ff4d4f' : isDoing ? '#0b4f6c' : '#cbd5e1';

            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={idx}>
                <div
                  style={{
                    borderRadius: 6,
                    border: `1px solid ${borderCol}`,
                    background: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '12px 14px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      backgroundColor: topBarCol,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <Text strong style={{ fontSize: 15, color: '#0b4f6c', display: 'block' }}>
                        {room.name}
                      </Text>
                      <Tag color="blue" style={{ marginTop: 2, marginRight: 0, fontSize: 11 }}>
                        {room.type}
                      </Tag>
                    </div>
                    {renderStatusTag(room.status)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserOutlined style={{ color: '#94a3b8' }} />
                      <Text type="secondary">Bác sĩ:</Text>
                      <Text strong style={{ color: '#1e293b' }}>{room.doctor}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TeamOutlined style={{ color: '#94a3b8' }} />
                      <Text type="secondary">BN:</Text>
                      <Text strong style={{ color: room.patient === '—' ? '#bfbfbf' : '#0b4f6c' }}>
                        {room.patient}
                      </Text>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default ExaminationFacility;