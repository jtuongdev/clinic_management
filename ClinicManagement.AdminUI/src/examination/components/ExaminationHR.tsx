import React, { useState } from 'react';
import { Table, Tag, Typography, Button, Space, Avatar, Tooltip } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface DoctorItem {
  name: string;
  dept: string;
  room: string;
  shift: string;
  status: 'doing' | 'alert' | 'idle' | string;
}

const mockHR = {
  kpis: [
    { label: 'Tổng nhân viên', value: '48', color: '#0b4f6c', bgColor: '#e8f4f7', icon: <TeamOutlined style={{ fontSize: 20, color: '#0b4f6c' }} /> },
    { label: 'Bác sĩ phụ trách', value: '12', color: '#0284c7', bgColor: '#e0f2fe', icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#0284c7' }} /> },
    { label: 'Điều dưỡng', value: '28', color: '#10b981', bgColor: '#ecfdf5', icon: <HeartOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Hành chính / Tiếp đón', value: '8', color: '#f59e0b', bgColor: '#fffbeb', icon: <UserOutlined style={{ fontSize: 20, color: '#f59e0b' }} /> },
    { label: 'Đang trực ca', value: '22', color: '#10b981', bgColor: '#ecfdf5', icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Nghỉ phép', value: '3', color: '#ef4444', bgColor: '#fef2f2', icon: <StopOutlined style={{ fontSize: 20, color: '#ef4444' }} /> },
  ],
  doctors: [
    { name: 'BS. Nguyễn Minh', dept: 'Nội tổng quát', room: 'P101', shift: '07:00 - 17:00', status: 'doing' },
    { name: 'BS. Trần Hoa', dept: 'Ngoại khoa', room: 'P205', shift: '07:00 - 17:00', status: 'doing' },
    { name: 'BS. Lê Tuấn', dept: 'Nhi khoa', room: 'P302', shift: '07:00 - 17:00', status: 'alert' },
    { name: 'BS. Phạm Lan', dept: 'Sản phụ khoa', room: 'P408', shift: '07:00 - 17:00', status: 'doing' },
    { name: 'BS. Văn Hùng', dept: 'Tai Mũi Họng', room: 'P510', shift: '07:00 - 17:00', status: 'idle' },
  ] as DoctorItem[],
};

const ExaminationHR: React.FC = () => {
  const [data] = useState(mockHR);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const columns: ColumnsType<DoctorItem> = [
    {
      title: 'Bác sĩ',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space orientation="horizontal" size="middle">
          <Avatar
            style={{ backgroundColor: '#0b4f6c', color: '#ffffff' }}
            icon={<UserOutlined />}
          >
            {name.replace('BS. ', '').charAt(0)}
          </Avatar>
          <Text strong style={{ color: '#0b4f6c' }}>
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'dept',
      key: 'dept',
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: 'Phòng trực',
      dataIndex: 'room',
      key: 'room',
      width: 120,
      render: (room) => <Text code strong>{room}</Text>,
    },
    {
      title: 'Ca trực',
      dataIndex: 'shift',
      key: 'shift',
      width: 180,
      render: (shift) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <Text>{shift}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        if (status === 'doing') return <Tag color="processing">Đang khám</Tag>;
        if (status === 'alert') return <Tag color="error">Quá tải</Tag>;
        return <Tag color="default">Rảnh</Tag>;
      },
    },
  ];

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
            <UserOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Danh sách Bác sĩ trực ca hiện tại
            </Text>
          </Space>
          <Tag color="cyan" style={{ borderRadius: 4, margin: 0 }}>
            {data.doctors.length} bác sĩ
          </Tag>
        </Space>

        <Tooltip title="Làm mới danh sách nhân sự">
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} size="middle">
            Làm mới
          </Button>
        </Tooltip>
      </div>

      {/* Edge-to-Edge Data Grid */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table<DoctorItem>
          columns={columns}
          dataSource={data.doctors.map((item, i) => ({ ...item, key: i }))}
          pagination={false}
          size="middle"
          loading={loading}
          locale={{ emptyText: 'Không có dữ liệu bác sĩ' }}
        />
      </div>
    </div>
  );
};

export default ExaminationHR;