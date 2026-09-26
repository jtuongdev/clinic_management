import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  App,
  Tooltip,
  Tag,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { LichHenDto, ThongKeLichHenDto } from '../types/appointment.types';
import { appointmentApi } from '../api/appointment.api';
import AppointmentDetailView from '../components/AppointmentDetailView';
import CreateAppointmentModal from '../components/CreateAppointmentModal';
import '../styles/appointment.css';

export const AppointmentManagementPage: React.FC = () => {
  const { message } = App.useApp();

  // State data
  const [appointments, setAppointments] = useState<LichHenDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [thongKe, setThongKe] = useState<ThongKeLichHenDto | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(dayjs());

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Selection & Modals
  const [selectedAppointment, setSelectedAppointment] = useState<LichHenDto | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch KPI statistics
  const fetchThongKe = useCallback(async () => {
    try {
      const formattedDate = dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined;
      const res = await appointmentApi.getThongKe(undefined, formattedDate);
      if (res.data.success && res.data.data) {
        setThongKe(res.data.data);
      }
    } catch {
      // non-blocking
    }
  }, [dateFilter]);

  // Fetch appointments list
  const fetchAppointments = useCallback(
    async (searchKw?: string) => {
      setLoading(true);
      try {
        const kw = searchKw !== undefined ? searchKw : keyword;
        const formattedDate = dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined;

        const res = await appointmentApi.getPaged({
          pageIndex,
          pageSize,
          keyword: kw?.trim() || undefined,
          trangThai: statusFilter || undefined,
          tuNgay: formattedDate,
          denNgay: formattedDate,
        });

        if (res.data.success && res.data.data) {
          const items = res.data.data.items ?? [];
          setAppointments(items);
          setTotal(res.data.data.totalCount ?? items.length);

          // Auto-select or maintain selection
          setSelectedAppointment((prev) => {
            if (!prev && items.length > 0) return items[0];
            if (prev) {
              const found = items.find((item) => item.id === prev.id);
              if (found) return found;
              if (items.length > 0) return items[0];
            }
            return null;
          });
        } else {
          message.error(res.data.message || 'Không thể tải danh sách lịch hẹn');
        }
      } catch {
        message.error('Lỗi kết nối khi tải danh sách lịch hẹn');
      } finally {
        setLoading(false);
      }
    },
    [keyword, statusFilter, dateFilter, pageIndex, pageSize, message]
  );

  useEffect(() => {
    fetchAppointments();
    fetchThongKe();
  }, [fetchAppointments, fetchThongKe]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchAppointments(keyword);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHO_XAC_NHAN':
        return <Badge status="warning" text="Chờ thu 100k" />;
      case 'DA_XAC_NHAN':
        return <Badge status="processing" text="Đã giữ chỗ" />;
      case 'DA_DEN':
        return <Badge status="success" text="Đã vào khám" />;
      case 'DANG_KHAM':
        return <Badge color="purple" text="Đang khám" />;
      case 'HOAN_THANH':
        return <Badge color="cyan" text="Hoàn thành" />;
      case 'DA_HUY':
        return <Badge status="error" text="Đã hủy" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Master Table Columns (Compact for 340px column)
  const masterColumns: ColumnsType<LichHenDto> = [
    {
      title: 'Bệnh nhân & Bác sĩ',
      key: 'info',
      render: (_, r) => (
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 12,
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {r.tenBenhNhan}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#0284c7',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: 1,
            }}
          >
            BS: {r.tenBacSi}
          </div>
          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>
            {r.soDienThoai || `BN#${r.maBenhNhan}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Giờ / TT',
      key: 'timeStatus',
      width: 105,
      render: (_, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#0f172a',
              fontFamily: 'monospace',
            }}
          >
            {r.khungGio}
          </span>
          {getStatusBadge(r.trangThai)}
          {r.daThanhToanGiuCho ? (
            <Tag color="blue" style={{ fontSize: 10, margin: 0, padding: '0 4px', lineHeight: '16px' }}>
              100k Cash
            </Tag>
          ) : (
            <Tag color="orange" style={{ fontSize: 10, margin: 0, padding: '0 4px', lineHeight: '16px' }}>
              Chưa thu
            </Tag>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="appointment-container">
      {/* ── TOP KPI STRIP ── */}
      <div className="appointment-kpi-grid">
        <div className="appointment-kpi-card">
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Tổng lịch hẹn</span>
            <span className="appointment-kpi-value">{thongKe?.tongLichHen ?? 0}</span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <CalendarOutlined />
          </div>
        </div>

        <div className="appointment-kpi-card">
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Chờ thu tiền cọc (100k)</span>
            <span className="appointment-kpi-value" style={{ color: '#d97706' }}>
              {thongKe?.choThuTien ?? 0}
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ClockCircleOutlined />
          </div>
        </div>

        <div className="appointment-kpi-card">
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Đã giữ chỗ (Đã thu 100k)</span>
            <span className="appointment-kpi-value" style={{ color: '#2563eb' }}>
              {thongKe?.daXacNhan ?? 0}
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="appointment-kpi-card">
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Đã tiếp đón vào khám</span>
            <span className="appointment-kpi-value" style={{ color: '#16a34a' }}>
              {thongKe?.daTiepNhan ?? 0}
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="appointment-kpi-card">
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Tổng cọc tiền mặt đã thu</span>
            <span className="appointment-kpi-value" style={{ color: '#0284c7', fontSize: 17 }}>
              {(thongKe?.tongTienDaThu ?? 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <DollarOutlined />
          </div>
        </div>
      </div>

      {/* ── ACTION TOOLBAR ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
            LỊCH HẸN KHÁM BỆNH
          </span>
          <Tag color="blue" style={{ fontWeight: 600 }}>
            {total} lịch hẹn
          </Tag>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
            style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
          >
            Đặt lịch hẹn mới
          </Button>
        </Space>
      </div>

      {/* ── MASTER-DETAIL SPLIT CONTAINER ── */}
      <div className="appointment-split-container">
        {/* MASTER PANEL (Left 340px) */}
        <div className="appointment-master-panel">
          <div className="appointment-master-header">
            <Input.Search
              placeholder="Tìm bệnh nhân, bác sĩ, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              allowClear
              size="small"
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <DatePicker
                value={dateFilter}
                onChange={(d) => setDateFilter(d)}
                format="DD/MM/YYYY"
                size="small"
                style={{ flex: 1 }}
                allowClear
                placeholder="Tất cả ngày"
              />
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                size="small"
                style={{ flex: 1.2 }}
                allowClear
                options={[
                  { label: 'Tất cả trạng thái', value: '' },
                  { label: 'Chờ thu cọc', value: 'CHO_XAC_NHAN' },
                  { label: 'Đã giữ chỗ', value: 'DA_XAC_NHAN' },
                  { label: 'Đã vào khám', value: 'DA_DEN' },
                  { label: 'Đang khám', value: 'DANG_KHAM' },
                  { label: 'Đã hủy', value: 'DA_HUY' },
                ]}
              />
              <Tooltip title="Tải lại">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchAppointments();
                    fetchThongKe();
                  }}
                  loading={loading}
                  size="small"
                />
              </Tooltip>
            </div>
          </div>

          <div className="appointment-master-table-wrapper">
            <Table<LichHenDto>
              className="appointment-master-table"
              rowKey={(r) => String(r.id)}
              columns={masterColumns}
              dataSource={appointments}
              loading={loading}
              size="small"
              rowClassName={(record) =>
                selectedAppointment?.id === record.id ? 'appointment-row-selected' : ''
              }
              onRow={(record) => ({
                onClick: () => setSelectedAppointment(record),
                style: { cursor: 'pointer' },
              })}
              pagination={{
                current: pageIndex,
                pageSize: pageSize,
                total: total,
                size: 'small',
                simple: true,
                onChange: (page, pSize) => {
                  setPageIndex(page);
                  setPageSize(pSize);
                },
              }}
            />
          </div>
        </div>

        {/* DETAIL PANEL (Right flex-1 min-w-0) */}
        <div className="appointment-detail-panel">
          <AppointmentDetailView
            appointment={selectedAppointment}
            onRefresh={() => {
              fetchAppointments();
              fetchThongKe();
            }}
          />
        </div>
      </div>

      {/* CREATE APPOINTMENT MODAL */}
      <CreateAppointmentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchAppointments();
          fetchThongKe();
        }}
      />
    </div>
  );
};
export default AppointmentManagementPage;
