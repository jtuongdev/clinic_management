import React, { useState, useEffect } from 'react';
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
import { dashboardApi, ExaminationHRDto } from '../../dashboard/api/dashboard.api';

const { Text } = Typography;

interface DoctorItem {
  id?: number;
  name: string;
  dept: string;
  room?: string;
  shift?: string;
  status: 'doing' | 'alert' | 'idle' | string;
}

const ExaminationHR: React.FC = () => {
  const [hrData, setHrData] = useState<ExaminationHRDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Tích hợp API Backend: GET /api/admin/dashboard/staff
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStaff({ facilityId: 1 });
      if (res.data?.success && res.data.data) {
        setHrData(res.data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const kpiList = hrData ? [
    { label: 'Tổng nhân viên', value: String(hrData.kpis.total), color: '#0b4f6c', bgColor: '#e8f4f7', icon: <TeamOutlined style={{ fontSize: 20, color: '#0b4f6c' }} /> },
    { label: 'Bác sĩ phụ trách', value: String(hrData.kpis.doctors), color: '#0284c7', bgColor: '#e0f2fe', icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#0284c7' }} /> },
    { label: 'Điều dưỡng', value: String(Math.max(0, hrData.kpis.total - hrData.kpis.doctors)), color: '#10b981', bgColor: '#ecfdf5', icon: <HeartOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Đang trực ca', value: String(hrData.kpis.onDuty), color: '#10b981', bgColor: '#ecfdf5', icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Nghỉ phép', value: String(hrData.kpis.leave), color: '#ef4444', bgColor: '#fef2f2', icon: <StopOutlined style={{ fontSize: 20, color: '#ef4444' }} /> },
  ] : [];

  const staffList: DoctorItem[] = (hrData?.staff && hrData.staff.length > 0)
    ? hrData.staff.map(s => ({
        id: s.id,
        name: s.name.startsWith('BS.') ? s.name : `BS. ${s.name}`,
        dept: s.dept || '--',
        room: s.room || '--',
        shift: s.shift || '--',
        status: s.status || 'doing',
      }))
    : [];

  const columns: ColumnsType<DoctorItem> = [
    {
      title: 'Bác sĩ',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: '#0b4f6c', color: '#ffffff' }} icon={<UserOutlined />}>
            {name.charAt(0)}
          </Avatar>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Khoa',
      dataIndex: 'dept',
      key: 'dept',
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: 'Phòng khám',
      dataIndex: 'room',
      key: 'room',
      render: (room) => <Text code>{room}</Text>,
    },
    {
      title: 'Ca trực',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift) => <Text type="secondary">{shift}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'doing' || status === 'active') return <Tag color="processing">Đang khám</Tag>;
        if (status === 'alert') return <Tag color="error">Quá tải</Tag>;
        return <Tag color="default">Chờ bệnh nhân</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0b2a3c', margin: 0 }}>
          Nhân sự & Lịch trực Khám bệnh
        </h3>
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={fetchStaff}
        >
          Làm mới
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {kpiList.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '14px 16px',
              border: '1px solid #e9edf4',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: kpi.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6a7f96' }}>{kpi.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color, marginTop: 2 }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e9edf4', padding: '16px' }}>
        <Table
          columns={columns}
          dataSource={staffList}
          rowKey={(record) => String(record.id || record.name)}
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </div>
    </div>
  );
};

export default ExaminationHR;
