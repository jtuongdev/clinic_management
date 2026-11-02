import React from 'react';
import { Card, Row, Col, Typography, Table, Tag, Empty, Space, Progress, Avatar } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SystemReportsProductivityDto } from '../types/systemReports.types';

const { Title, Text } = Typography;

interface ProductivityTabProps {
  data: SystemReportsProductivityDto | null;
  loading: boolean;
}

const formatCurrency = (val: number) => {
  return (val || 0).toLocaleString('vi-VN') + ' đ';
};

export const ProductivityTab: React.FC<ProductivityTabProps> = ({ data, loading }) => {
  if (!data && !loading) {
    return <Empty description="Chưa có dữ liệu hiệu suất bác sĩ" style={{ padding: 40 }} />;
  }

  const doctorColumns: ColumnsType<any> = [
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (name: string) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: '#0b4f6c' }} icon={<UserOutlined />}>
            {name.charAt(name.lastIndexOf(' ') + 1 || 0)}
          </Avatar>
          <Text strong>{name.startsWith('BS.') ? name : `BS. ${name}`}</Text>
        </Space>
      ),
    },
    {
      title: 'Khoa',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: 'Lượt tiếp nhận',
      dataIndex: 'totalVisits',
      key: 'totalVisits',
      align: 'right',
      render: (v) => <strong>{v} ca</strong>,
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completedVisits',
      key: 'completedVisits',
      align: 'right',
      render: (c, r) => {
        const rate = r.totalVisits > 0 ? Math.round((c / r.totalVisits) * 100) : 0;
        return (
          <Space>
            <span>{c}</span>
            <Tag color={rate >= 80 ? 'success' : 'warning'}>{rate}%</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Đơn thuốc kê',
      dataIndex: 'prescriptionsCount',
      key: 'prescriptionsCount',
      align: 'right',
      render: (p) => `${p} đơn`,
    },
    {
      title: 'Chỉ định CLS',
      dataIndex: 'clsOrdersCount',
      key: 'clsOrdersCount',
      align: 'right',
      render: (cls) => `${cls} ca`,
    },
    {
      title: 'Doanh thu phát sinh',
      dataIndex: 'revenueGenerated',
      key: 'revenueGenerated',
      align: 'right',
      render: (rev) => <span style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(rev)}</span>,
    },
  ];

  const roomColumns: ColumnsType<any> = [
    {
      title: 'Phòng khám',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Khoa trực thuộc',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="cyan">{dept}</Tag>,
    },
    {
      title: 'Lượt phục vụ',
      dataIndex: 'visitsCount',
      key: 'visitsCount',
      align: 'right',
      render: (v) => <span style={{ fontWeight: 700, color: '#0284c7' }}>{v} ca</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Bảng hiệu suất Bác sĩ */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: '#f59e0b' }} />
            <span>Năng suất & Hiệu quả làm việc của Bác sĩ</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={doctorColumns}
          dataSource={data?.doctorRankings || []}
          rowKey={(r) => r.doctorId}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* Công suất sử dụng buồng khám / phòng khám */}
      <Card
        title={
          <Space>
            <AppstoreOutlined style={{ color: '#0284c7' }} />
            <span>Công suất tiếp nhận theo Buồng / Phòng khám</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={roomColumns}
          dataSource={data?.roomUtilization || []}
          rowKey={(r) => r.roomId}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};
