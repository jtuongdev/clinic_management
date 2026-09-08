import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Alert,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Spin,
} from 'antd';
import {
  FilePdfOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  MedicineBoxOutlined,
  RiseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useExamination } from '../hook/useExamination';
import { LuotKhamDangXuLyDto } from '../type/examination.types';

const { Text } = Typography;

const ExaminationOverview: React.FC = () => {
  const {
    thongKe,
    bacSiTruc,
    luotKhamDangXuLy,
    loadingThongKe,
    loadingBacSiTruc,
    loadingLuotKhamDangXuLy,
    error,
  } = useExamination();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const isLoading = loadingThongKe || loadingBacSiTruc || loadingLuotKhamDangXuLy;

  // KPI cards
  const kpis = useMemo(() => {
    if (!thongKe) return [];
    const choKham =
      thongKe?.theoTrangThai?.find((t) => t.trangThai === 'CHO_KHAM')?.soLuong ?? 0;
    const topKhoa =
      thongKe?.theoKhoa && thongKe.theoKhoa.length > 0 ? thongKe.theoKhoa[0] : null;

    return [
      {
        title: 'Tổng lượt khám',
        value: thongKe.tongLuotKham ?? 0,
        icon: <MedicineBoxOutlined style={{ color: '#0b4f6c', fontSize: 20 }} />,
        bgColor: '#e8f4f7',
        meta: 'Toàn hệ thống',
      },
      {
        title: 'Lượt khám hôm nay',
        value: thongKe.homNay ?? 0,
        icon: <RiseOutlined style={{ color: '#0284c7', fontSize: 20 }} />,
        bgColor: '#e0f2fe',
        meta: 'Cập nhật thời gian thực',
      },
      {
        title: 'Lượt khám tuần này',
        value: thongKe.tuanNay ?? 0,
        icon: <CheckCircleOutlined style={{ color: '#10b981', fontSize: 20 }} />,
        bgColor: '#ecfdf5',
        meta: 'So với tuần trước',
      },
      {
        title: 'Bệnh nhân chờ khám',
        value: choKham,
        icon: <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 20 }} />,
        bgColor: '#fffbeb',
        meta: 'Cần giải tỏa',
      },
      {
        title: 'Khoa đông nhất',
        value: topKhoa ? topKhoa.tenKhoa : '--',
        icon: <ApartmentOutlined style={{ color: '#ef4444', fontSize: 20 }} />,
        bgColor: '#fef2f2',
        meta: topKhoa ? `${topKhoa.soLuong} lượt khám` : 'Chưa có dữ liệu',
        isText: true,
      },
    ];
  }, [thongKe]);

  // Departments for progress list
  const departments = useMemo(() => {
    if (!thongKe?.theoKhoa) return [];
    const total = thongKe.tongLuotKham || 1;
    const colors = ['#0b4f6c', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];
    return thongKe.theoKhoa.map((k, index) => ({
      name: k.tenKhoa,
      value: k.soLuong,
      percent: Math.min(100, Math.round((k.soLuong / total) * 100)),
      color: colors[index % colors.length],
    }));
  }, [thongKe]);

  // Filtered active visits
  const filteredActiveVisits = useMemo(() => {
    return luotKhamDangXuLy.filter((item) => {
      const matchKeyword =
        !searchKeyword ||
        item.maLuotKham?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.tenBenhNhan?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.bacSi?.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchStatus =
        statusFilter === 'ALL' || item.trangThai === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [luotKhamDangXuLy, searchKeyword, statusFilter]);

  // Table columns for active visits
  const columns: ColumnsType<LuotKhamDangXuLyDto> = [
    {
      title: 'Mã lượt',
      dataIndex: 'maLuotKham',
      key: 'maLuotKham',
      width: 130,
      render: (text) => <Text code strong>{text}</Text>,
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
      render: (text) => <Text strong style={{ color: '#0b4f6c' }}>{text}</Text>,
    },
    {
      title: 'Khoa',
      dataIndex: 'khoa',
      key: 'khoa',
      width: 140,
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'bacSi',
      key: 'bacSi',
      width: 160,
    },
    {
      title: 'Phòng',
      dataIndex: 'phong',
      key: 'phong',
      width: 110,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'thoiGianBatDauKham',
      key: 'thoiGianBatDauKham',
      width: 120,
      render: (text) =>
        text ? new Date(text).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (status) => {
        switch (status) {
          case 'DangKham':
          case 'DANG_KHAM':
            return <Tag color="processing">Đang khám</Tag>;
          case 'Cho':
          case 'CHO_KHAM':
            return <Tag color="warning">Chờ khám</Tag>;
          case 'ChoCLS':
          case 'CHO_CLS':
            return <Tag color="purple">Chờ CLS</Tag>;
          default:
            return <Tag color="default">{status || 'Đang xử lý'}</Tag>;
        }
      },
    },
  ];

  if (error) {
    return <Alert type="error" title="Lỗi tải dữ liệu" description={error} showIcon style={{ marginBottom: 16 }} />;
  }

  const doctorColumns: ColumnsType<any> = [
    {
      title: 'Bác sĩ',
      dataIndex: 'hoTen',
      key: 'hoTen',
      render: (text: string) => <Text strong style={{ color: '#0b4f6c' }}>{text}</Text>,
    },
    {
      title: 'Khoa',
      dataIndex: 'khoa',
      key: 'khoa',
      width: 140,
    },
    {
      title: 'Phòng',
      dataIndex: 'phong',
      key: 'phong',
      width: 110,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'alert' ? 'error' : status === 'doing' ? 'processing' : 'success'}>
          {status === 'alert' ? 'Quá tải' : status === 'doing' ? 'Đang khám' : 'Rảnh'}
        </Tag>
      ),
    },
    {
      title: 'Số chờ',
      dataIndex: 'soLuongCho',
      key: 'soLuongCho',
      width: 100,
      render: (count: number) => <Tag color={count > 5 ? 'warning' : 'default'}>{count} BN</Tag>,
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          minHeight: '100%',
        }}
      >
        {/* Header Toolbar */}
        <div
          style={{
            minHeight: 46,
            padding: '6px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginRight: 12 }}>
              Giám sát hoạt động khám bệnh
            </span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chỉ số KPI thời gian thực, cảnh báo quá tải và lưu lượng các chuyên khoa
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={() => alert('Xuất báo cáo tổng quan')}
              size="middle"
            >
              Xuất báo cáo
            </Button>
          </Space>
        </div>

        {/* Top KPI Ribbon */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            flexShrink: 0,
          }}
        >
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                  {kpi.title}
                </Text>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: kpi.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {kpi.icon}
                </div>
              </div>
              {kpi.isText ? (
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0b2a3c', marginBottom: 2 }}>
                  {kpi.value}
                </div>
              ) : (
                <Statistic
                  value={kpi.value}
                  styles={{ content: { fontSize: 20, fontWeight: 700, color: '#0b2a3c' } }}
                />
              )}
              <Text type="secondary" style={{ fontSize: 11, marginTop: 2 }}>
                {kpi.meta}
              </Text>
            </div>
          ))}
        </div>

        {/* Real-time Alerts Strip */}
        <div
          style={{
            padding: '10px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertOutlined style={{ color: '#f59e0b', fontSize: 14 }} />
            <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
              Cảnh báo vận hành
            </Text>
          </div>
          <Row gutter={[10, 10]}>
            <Col xs={24} md={8}>
              <Alert
                title={`Khoa ${departments[0]?.name || 'Nhi'} đang quá tải`}
                description="Hơn 30 lượt bệnh nhân chờ khám vượt ngưỡng cảnh báo."
                type="warning"
                showIcon
              />
            </Col>
            <Col xs={24} md={8}>
              <Alert
                title="Thời gian chờ khám kéo dài tại P302"
                description="Thời gian chờ trung bình 22 phút, cần điều phối hỗ trợ."
                type="info"
                showIcon
              />
            </Col>
            <Col xs={24} md={8}>
              <Alert
                title="Kiểm tra phân ca trực bác sĩ"
                description="1 bác sĩ chưa nhận phòng khám theo lịch phân công sáng nay."
                type="error"
                showIcon
              />
            </Col>
          </Row>
        </div>

        {/* Middle Row: Department Volume + Online Clinic Status */}
        <Row style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Col xs={24} lg={14} style={{ borderRight: '1px solid #e2e8f0', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Space size="small">
                <ApartmentOutlined style={{ color: '#0b4f6c' }} />
                <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                  Lưu lượng khám theo chuyên khoa
                </Text>
              </Space>
              <Tag color="blue" style={{ margin: 0 }}>
                {departments.length} khoa đang mở
              </Tag>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {departments.length === 0 ? (
                <Text type="secondary">Chưa có dữ liệu thống kê khoa.</Text>
              ) : (
                departments.map((dept, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text strong style={{ fontSize: 12, color: '#334155' }}>
                        {dept.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <strong>{dept.value}</strong> lượt ({dept.percent}%)
                      </Text>
                    </div>
                    <Progress percent={dept.percent} strokeColor={dept.color} showInfo={false} size={['100%', 6]} />
                  </div>
                ))
              )}
            </div>
          </Col>

          <Col xs={24} lg={10} style={{ padding: 16, background: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Space size="small">
                <ClockCircleOutlined style={{ color: '#0b4f6c' }} />
                <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                  Trạng thái phòng khám trực tuyến
                </Text>
              </Space>
            </div>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <div style={{ background: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 12 }}>
                  <Statistic
                    title="Chờ khám"
                    value={thongKe?.theoTrangThai?.find((t) => t.trangThai === 'CHO_KHAM')?.soLuong ?? 0}
                    styles={{ content: { color: '#f59e0b', fontWeight: 700, fontSize: 18 } }}
                    prefix={<ClockCircleOutlined />}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 12 }}>
                  <Statistic
                    title="Đang khám"
                    value={thongKe?.theoTrangThai?.find((t) => t.trangThai === 'DANG_KHAM')?.soLuong ?? 0}
                    styles={{ content: { color: '#10b981', fontWeight: 700, fontSize: 18 } }}
                    prefix={<MedicineBoxOutlined />}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 12 }}>
                  <Statistic
                    title="Phòng đang mở"
                    value="18 / 24"
                    styles={{ content: { color: '#0b4f6c', fontWeight: 700, fontSize: 18 } }}
                    prefix={<ApartmentOutlined />}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 12 }}>
                  <Statistic
                    title="Thời gian chờ TB"
                    value="14 phút"
                    styles={{ content: { color: '#0284c7', fontWeight: 700, fontSize: 18 } }}
                    prefix={<RiseOutlined />}
                  />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Active Visits Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            }}
          >
            <Space size="middle">
              <Space size="small">
                <MedicineBoxOutlined style={{ color: '#0b4f6c', fontSize: 15 }} />
                <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                  Lượt khám đang xử lý trong ca
                </Text>
              </Space>
              <Tag color="blue" style={{ margin: 0 }}>
                {filteredActiveVisits.length} lượt
              </Tag>
            </Space>

            <Space wrap size="small">
              <Input
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Tìm mã lượt, bệnh nhân, bác sĩ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{ width: 250 }}
                size="middle"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                size="middle"
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'DangKham', label: 'Đang khám' },
                  { value: 'Cho', label: 'Chờ khám' },
                  { value: 'ChoCLS', label: 'Chờ CLS' },
                ]}
              />
            </Space>
          </div>

          <Table<LuotKhamDangXuLyDto>
            rowKey="id"
            columns={columns}
            dataSource={filteredActiveVisits}
            loading={loadingLuotKhamDangXuLy}
            size="middle"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              showTotal: (total) => `Tổng ${total} lượt đang xử lý`,
              style: { padding: '8px 16px', margin: 0 },
            }}
          />
        </div>

        {/* Doctors on duty Section */}
        {bacSiTruc && bacSiTruc.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #e2e8f0' }}>
            <div
              style={{
                height: 42,
                padding: '0 16px',
                borderBottom: '1px solid #e2e8f0',
                background: '#fafbfc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Space size="small">
                <UserOutlined style={{ color: '#0b4f6c' }} />
                <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                  Bác sĩ trực phòng khám
                </Text>
              </Space>
              <Tag color="cyan" style={{ margin: 0 }}>
                {bacSiTruc.length} bác sĩ
              </Tag>
            </div>
            <Table
              rowKey="id"
              columns={doctorColumns}
              dataSource={bacSiTruc}
              loading={loadingBacSiTruc}
              size="middle"
              pagination={{ pageSize: 5, style: { padding: '8px 16px', margin: 0 } }}
            />
          </div>
        )}
      </div>
    </Spin>
  );
};

export default ExaminationOverview;