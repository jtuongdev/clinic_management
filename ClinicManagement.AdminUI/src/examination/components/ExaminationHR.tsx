import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Tag, Typography, Button, Space, Avatar, Input, Select, Badge, Card, Row, Col, Tooltip } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { dashboardApi, ExaminationHRDto } from '../../dashboard/api/dashboard.api';
import { useExamination } from '../hook/useExamination';

const { Text } = Typography;

interface StaffTableItem {
  id: number;
  name: string;
  title: string;
  isDoctor: boolean;
  isNurse: boolean;
  specialty?: string;
  dept: string;
  room?: string;
  shift?: string;
  status: string;
  waitingCount: number;
  phone?: string;
}

const ExaminationHR: React.FC = () => {
  const { filters } = useExamination();

  const [hrData, setHrData] = useState<ExaminationHRDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Gọi API lấy danh sách nhân sự đồng bộ theo filters từ Ribbon (Cơ sở, Khoa)
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStaff({
        facilityId: filters.maCoSo,
        departmentId: filters.maKhoa,
      });
      if (res.data?.success && res.data.data) {
        setHrData(res.data.data);
      }
    } catch {
      // Giữ nguyên dữ liệu cũ nếu lỗi
    } finally {
      setLoading(false);
    }
  }, [filters.maCoSo, filters.maKhoa]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Danh sách KPI chi tiết chuẩn hóa theo hệ thống
  const kpiList = useMemo(() => {
    if (!hrData) return [];
    return [
      {
        label: 'Tổng nhân sự',
        value: String(hrData.kpis.total || 0),
        color: '#0b4f6c',
        bgColor: '#e8f4f7',
        icon: <TeamOutlined style={{ fontSize: 20, color: '#0b4f6c' }} />,
      },
      {
        label: 'Bác sĩ phụ trách',
        value: String(hrData.kpis.doctors || 0),
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#0284c7' }} />,
      },
      {
        label: 'Điều dưỡng & Y tế',
        value: String(hrData.kpis.nurses || Math.max(0, (hrData.kpis.total || 0) - (hrData.kpis.doctors || 0))),
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <HeartOutlined style={{ fontSize: 20, color: '#10b981' }} />,
      },
      {
        label: 'Đang trực ca',
        value: String(hrData.kpis.onDuty || 0),
        color: '#059669',
        bgColor: '#d1fae5',
        icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#059669' }} />,
      },
      {
        label: 'Đang khám bệnh',
        value: String(hrData.kpis.doing || 0),
        color: '#3b82f6',
        bgColor: '#eff6ff',
        icon: <SyncOutlined style={{ fontSize: 20, color: '#3b82f6' }} />,
      },
      {
        label: 'Bác sĩ quá tải',
        value: String(hrData.kpis.alert || 0),
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: <ExclamationCircleOutlined style={{ fontSize: 20, color: '#ef4444' }} />,
      },
      {
        label: 'Nghỉ phép',
        value: String(hrData.kpis.leave || 0),
        color: '#6b7280',
        bgColor: '#f3f4f6',
        icon: <StopOutlined style={{ fontSize: 20, color: '#6b7280' }} />,
      },
    ];
  }, [hrData]);

  // Lọc danh sách nhân viên theo tìm kiếm và bộ lọc tại chỗ
  const filteredStaff = useMemo(() => {
    if (!hrData?.staff) return [];
    return hrData.staff
      .map((s) => ({
        id: s.id,
        name: s.name,
        title: s.title || (s.isDoctor ? 'Bác sĩ' : s.isNurse ? 'Điều dưỡng' : 'Nhân viên'),
        isDoctor: !!s.isDoctor,
        isNurse: !!s.isNurse,
        specialty: s.specialty,
        dept: s.dept || '--',
        room: s.room || '--',
        shift: s.shift || '--',
        status: s.status || 'active',
        waitingCount: s.waitingCount || 0,
        phone: s.phone,
      }))
      .filter((s) => {
        // Lọc theo từ khóa
        if (searchText.trim()) {
          const q = searchText.toLowerCase().trim();
          const matchName = s.name.toLowerCase().includes(q);
          const matchDept = s.dept.toLowerCase().includes(q);
          const matchSpecialty = s.specialty?.toLowerCase().includes(q);
          const matchPhone = s.phone?.includes(q);
          if (!matchName && !matchDept && !matchSpecialty && !matchPhone) return false;
        }

        // Lọc theo vai trò
        if (roleFilter === 'doctor' && !s.isDoctor) return false;
        if (roleFilter === 'nurse' && !s.isNurse) return false;
        if (roleFilter === 'other' && (s.isDoctor || s.isNurse)) return false;

        // Lọc theo trạng thái
        if (statusFilter !== 'all') {
          if (statusFilter === 'doing' && s.status !== 'doing') return false;
          if (statusFilter === 'alert' && s.status !== 'alert') return false;
          if (statusFilter === 'idle' && s.status !== 'idle' && s.status !== 'active') return false;
          if (statusFilter === 'leave' && s.status !== 'leave') return false;
        }

        return true;
      });
  }, [hrData, searchText, roleFilter, statusFilter]);

  const columns: ColumnsType<StaffTableItem> = [
    {
      title: 'Nhân sự',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: StaffTableItem) => {
        const avatarBg = record.isDoctor ? '#0b4f6c' : record.isNurse ? '#10b981' : '#6366f1';
        return (
          <Space size="middle" align="center">
            <Avatar style={{ backgroundColor: avatarBg, color: '#ffffff', fontWeight: 600 }}>
              {name.charAt(name.lastIndexOf(' ') + 1 || 0)}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                {record.isDoctor && !name.startsWith('BS.') ? `BS. ${name}` : name}
              </div>
              <Space size={6} wrap style={{ marginTop: 2 }}>
                <Tag color={record.isDoctor ? 'blue' : record.isNurse ? 'green' : 'purple'} style={{ margin: 0, fontSize: 11 }}>
                  {record.title}
                </Tag>
                {record.specialty && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.specialty}
                  </Text>
                )}
                {record.phone && (
                  <Tooltip title="Số điện thoại">
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <PhoneOutlined /> {record.phone}
                    </Text>
                  </Tooltip>
                )}
              </Space>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Khoa trực thuộc',
      dataIndex: 'dept',
      key: 'dept',
      render: (dept: string) => <Tag color="cyan">{dept}</Tag>,
    },
    {
      title: 'Phòng khám',
      dataIndex: 'room',
      key: 'room',
      render: (room: string) => <Text code>{room}</Text>,
    },
    {
      title: 'Ca trực',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift: string) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#0284c7' }} />
          <Text style={{ fontSize: 13 }}>{shift}</Text>
        </Space>
      ),
    },
    {
      title: 'Tải khám / Chờ khám',
      key: 'workload',
      render: (_, record: StaffTableItem) => {
        if (!record.isDoctor) {
          return <Text type="secondary">--</Text>;
        }
        if (record.waitingCount >= 4) {
          return (
            <Badge
              count={`${record.waitingCount} bệnh nhân chờ`}
              style={{ backgroundColor: '#ef4444' }}
            />
          );
        }
        if (record.waitingCount > 0) {
          return (
            <Badge
              count={`${record.waitingCount} chờ khám`}
              style={{ backgroundColor: '#f59e0b' }}
            />
          );
        }
        return <Text type="secondary">0 lượt chờ</Text>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: StaffTableItem) => {
        if (status === 'doing') {
          return (
            <Tag icon={<SyncOutlined spin />} color="processing">
              Đang khám
            </Tag>
          );
        }
        if (status === 'alert') {
          return (
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              Quá tải ({record.waitingCount})
            </Tag>
          );
        }
        if (status === 'leave') {
          return (
            <Tag icon={<StopOutlined />} color="default">
              Nghỉ phép
            </Tag>
          );
        }
        if (status === 'idle') {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Chờ bệnh nhân
            </Tag>
          );
        }
        return (
          <Tag icon={<CheckCircleOutlined />} color="cyan">
            Sẵn sàng
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tiêu đề & Làm mới */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0b2a3c', margin: 0 }}>
            Nhân sự & Lịch trực Khám bệnh
          </h3>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Theo dõi phân bổ bác sĩ, điều dưỡng, phòng khám và trạng thái tiếp nhận bệnh nhân theo thời gian thực
          </Text>
        </div>
        <Button
          type="primary"
          ghost
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={fetchStaff}
        >
          Làm mới dữ liệu
        </Button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        {kpiList.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              borderRadius: 8,
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
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
              <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{kpi.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color, marginTop: 1 }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bộ lọc tại chỗ */}
      <Card
        size="small"
        style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
        styles={{ body: { padding: '10px 14px' } }}
      >
        <Row gutter={[12, 8]} align="middle">
          <Col xs={24} sm={10} md={8}>
            <Input
              placeholder="Tìm theo tên bác sĩ, khoa, SĐT..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              style={{ width: '100%' }}
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'Tất cả chức danh' },
                { value: 'doctor', label: 'Bác sĩ phụ trách' },
                { value: 'nurse', label: 'Điều dưỡng & Y tá' },
                { value: 'other', label: 'Khác (Dược sĩ, Admin...)' },
              ]}
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'doing', label: 'Đang khám' },
                { value: 'alert', label: 'Quá tải (>= 4 chờ)' },
                { value: 'idle', label: 'Sẵn sàng / Chờ khám' },
                { value: 'leave', label: 'Nghỉ phép' },
              ]}
            />
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiển thị: <strong style={{ color: '#0b4f6c' }}>{filteredStaff.length}</strong> nhân sự
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Bảng danh sách Nhân sự */}
      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredStaff}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nhân sự`,
          }}
          size="middle"
        />
      </div>
    </div>
  );
};

export default ExaminationHR;
