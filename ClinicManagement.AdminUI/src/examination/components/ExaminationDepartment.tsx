import React, { useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Table,
  Tag,
  Progress,
  Typography,
  Button,
  Space,
  Spin,
  Empty,
  Rate,
} from 'antd';
import {
  ApartmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useExamination } from '../hook/useExamination';
import { KhoaOverviewDto } from '../../department/type/department.type';

const { Text } = Typography;

const ExaminationDepartment: React.FC = () => {
  const {
    khoaOverview,
    loadingKhoaOverview,
    fetchKhoaOverview,
    filters,
  } = useExamination();

  // Gọi API khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchKhoaOverview();
  }, [filters]);

  // KPI từ dữ liệu khoa
  const kpis = useMemo(() => {
    if (!khoaOverview || khoaOverview.length === 0) return [];
    const tongLuot = khoaOverview.reduce((sum, k) => sum + k.tongLuotKham, 0);
    const tongCho = khoaOverview.reduce((sum, k) => sum + k.soLuotCho, 0);
    const tongBS = khoaOverview.reduce((sum, k) => sum + k.soBacSi, 0);
    const hoatDong = khoaOverview.filter((k) => k.trangThai === 'HoatDong').length;
    const quaTai = khoaOverview.filter((k) => k.trangThai === 'QuaTai').length;

    return [
      {
        label: 'Tổng lượt khám',
        value: tongLuot,
        color: '#0b4f6c',
        bgColor: '#e8f4f7',
        icon: <ApartmentOutlined style={{ fontSize: 20, color: '#0b4f6c' }} />,
      },
      {
        label: 'Tổng chờ khám',
        value: tongCho,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b' }} />,
      },
      {
        label: 'Tổng số khoa',
        value: khoaOverview.length,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <ApartmentOutlined style={{ fontSize: 20, color: '#0284c7' }} />,
      },
      {
        label: 'Tổng bác sĩ',
        value: tongBS,
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        icon: <UserOutlined style={{ fontSize: 20, color: '#8b5cf6' }} />,
      },
      {
        label: 'Khoa hoạt động',
        value: hoatDong,
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} />,
      },
      {
        label: 'Khoa quá tải',
        value: quaTai,
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: <AlertOutlined style={{ fontSize: 20, color: '#ef4444' }} />,
      },
    ];
  }, [khoaOverview]);

  // Dữ liệu cho bar chart số lượng chờ
  const maxWait = useMemo(() => {
    return Math.max(...khoaOverview.map((k) => k.soLuotCho), 1);
  }, [khoaOverview]);

  const waitTimes = useMemo(() => {
    return khoaOverview.map((k) => ({
      name: k.tenKhoa,
      value: k.soLuotCho,
      percent: Math.round((k.soLuotCho / maxWait) * 100),
      color: k.soLuotCho >= 10 ? '#ef4444' : k.soLuotCho >= 5 ? '#f59e0b' : '#10b981',
    }));
  }, [khoaOverview, maxWait]);

  // Đánh giá hài lòng mock ổn định
  const satisfaction = useMemo(() => {
    const defaultRatings = [4.8, 4.6, 4.9, 4.5, 4.7, 4.6];
    return khoaOverview.map((k, idx) => ({
      name: k.tenKhoa,
      rating: defaultRatings[idx % defaultRatings.length],
    }));
  }, [khoaOverview]);

  const columns: ColumnsType<KhoaOverviewDto> = [
    {
      title: 'Tên khoa',
      dataIndex: 'tenKhoa',
      key: 'tenKhoa',
      render: (text) => <Text strong style={{ color: '#0b4f6c' }}>{text}</Text>,
    },
    {
      title: 'Tổng lượt khám',
      dataIndex: 'tongLuotKham',
      key: 'tongLuotKham',
      align: 'right',
      render: (val) => <Text strong>{val}</Text>,
    },
    {
      title: 'Đang chờ',
      dataIndex: 'soLuotCho',
      key: 'soLuotCho',
      align: 'center',
      render: (count) => (
        <Tag color={count >= 10 ? 'error' : count >= 5 ? 'warning' : 'default'}>
          {count} lượt
        </Tag>
      ),
    },
    {
      title: 'Số bác sĩ',
      dataIndex: 'soBacSi',
      key: 'soBacSi',
      align: 'center',
      render: (count) => <Tag color="blue">{count} BS</Tag>,
    },
    {
      title: 'Trạng thái hoạt động',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 160,
      render: (status) => {
        if (status === 'QuaTai') return <Tag color="error">Quá tải</Tag>;
        if (status === 'HoatDong') return <Tag color="success">Hoạt động bình thường</Tag>;
        return <Tag color="default">Bình thường</Tag>;
      },
    },
  ];

  if (loadingKhoaOverview) {
    return <Spin tip="Đang tải dữ liệu khoa..." style={{ padding: 40 }} />;
  }

  if (khoaOverview.length === 0) {
    return <Empty description="Không có dữ liệu hiệu suất khoa" style={{ padding: 40 }} />;
  }

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
        {kpis.map((kpi, idx) => (
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

      {/* Toolbar */}
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
            <ApartmentOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Danh sách khoa khám bệnh
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
            {khoaOverview.length} khoa
          </Tag>
        </Space>

        <Space>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => alert('So sánh hiệu suất các khoa')}
            size="middle"
          >
            So sánh các khoa
          </Button>
        </Space>
      </div>

      {/* Main Department Table */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table<KhoaOverviewDto>
          rowKey="tenKhoa"
          columns={columns}
          dataSource={khoaOverview}
          pagination={false}
          size="middle"
        />
      </div>

      {/* Bottom Split: Wait Progress + Satisfaction */}
      <Row style={{ borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
        <Col xs={24} lg={14} style={{ borderRight: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ClockCircleOutlined style={{ color: '#0b4f6c' }} />
            <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
              Số lượng bệnh nhân chờ theo khoa
            </Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {waitTimes.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text strong style={{ fontSize: 12, color: '#334155' }}>
                    {item.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <strong>{item.value}</strong> đang chờ
                  </Text>
                </div>
                <Progress percent={item.percent} strokeColor={item.color} showInfo={false} size={['100%', 6]} />
              </div>
            ))}
          </div>
        </Col>

        <Col xs={24} lg={10} style={{ padding: 16, background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span>⭐</span>
            <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
              Đánh giá mức độ hài lòng
            </Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {satisfaction.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  background: '#ffffff',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Text strong style={{ color: '#0b4f6c', fontSize: 13 }}>{item.name}</Text>
                <Space size="middle">
                  <Rate disabled allowHalf defaultValue={item.rating} style={{ fontSize: 13 }} />
                  <Text strong style={{ color: '#f59e0b', fontSize: 13 }}>{item.rating}</Text>
                </Space>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ExaminationDepartment;