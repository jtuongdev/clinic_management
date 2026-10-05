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
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { LichHenDto, ThongKeLichHenDto } from '../types/appointment.types';
import { appointmentApi } from '../api/appointment.api';
import AppointmentDetailView from '../components/AppointmentDetailView';
import CreateAppointmentModal from '../components/CreateAppointmentModal';
import '../styles/appointment.css';

type TabKey = 'PENDING' | 'CONFIRMED' | 'TODAY' | 'ALL';

type ConfirmedRange = [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;

export const AppointmentManagementPage: React.FC = () => {
  const { message } = App.useApp();

  // Tab State: 'PENDING' (Cần duyệt / Chờ thu cọc), 'CONFIRMED' (Đã xác nhận / Đã giữ chỗ),
  // 'TODAY' (Tiếp đón hôm nay), 'ALL' (Tra cứu tất cả)
  const [activeTab, setActiveTab] = useState<TabKey>('PENDING');

  // Bộ lọc riêng cho tab "Đã xác nhận": khoảng ngày (mặc định hôm nay → 7 ngày tới)
  const [confirmedRange, setConfirmedRange] = useState<ConfirmedRange>([
    dayjs(),
    dayjs().add(7, 'day'),
  ]);
  // Tổng số lịch đã xác nhận sắp tới (badge trên tab)
  const [confirmedCount, setConfirmedCount] = useState(0);

  // State data
  const [appointments, setAppointments] = useState<LichHenDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [thongKePending, setThongKePending] = useState<ThongKeLichHenDto | null>(null);
  const [thongKeToday, setThongKeToday] = useState<ThongKeLichHenDto | null>(null);

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

  // Fetch KPI statistics: 1 cho toàn hệ thống (Pending), 1 cho ngày hôm nay
  const fetchThongKe = useCallback(async () => {
    try {
      // 1. Thống kê toàn cục để lấy số lượng chờ thu tiền cọc / chờ duyệt
      const resPending = await appointmentApi.getThongKe();
      if (resPending.data.success && resPending.data.data) {
        setThongKePending(resPending.data.data);
      }

      // 2. Thống kê riêng cho ngày hôm nay (tiếp đón, đã giữ chỗ, doanh thu trong ngày)
      const todayStr = dayjs().format('YYYY-MM-DD');
      const resToday = await appointmentApi.getThongKe(undefined, todayStr);
      if (resToday.data.success && resToday.data.data) {
        setThongKeToday(resToday.data.data);
      }

      // 3. Tổng số lịch đã xác nhận (đã giữ chỗ) từ hôm nay trở đi
      const resConfirmed = await appointmentApi.getPaged({
        pageIndex: 1,
        pageSize: 1,
        trangThai: 'DA_XAC_NHAN',
        tuNgay: todayStr,
      });
      if (resConfirmed.data.success && resConfirmed.data.data) {
        setConfirmedCount(resConfirmed.data.data.totalCount ?? 0);
      }
    } catch {
      // non-blocking
    }
  }, []);

  // Fetch appointments list
  const fetchAppointments = useCallback(
    async (searchKw?: string) => {
      setLoading(true);
      try {
        const kw = searchKw !== undefined ? searchKw : keyword;
        const todayStr = dayjs().format('YYYY-MM-DD');

        let reqTuNgay: string | undefined = undefined;
        let reqDenNgay: string | undefined = undefined;
        let reqTrangThai: string | undefined = undefined;

        if (activeTab === 'PENDING') {
          // Tab 1: CẦN DUYỆT -> Lấy TẤT CẢ các lịch hẹn từ hôm nay trở đi có trạng thái CHO_XAC_NHAN
          reqTuNgay = todayStr;
          reqDenNgay = undefined; // Không giới hạn ngày kết thúc để bắt được lịch 2, 3 ngày tới, tuần sau...
          reqTrangThai = 'CHO_XAC_NHAN';
        } else if (activeTab === 'CONFIRMED') {
          // Tab 2: ĐÃ XÁC NHẬN -> Lịch đã thu cọc / giữ chỗ (DA_XAC_NHAN) trong khoảng ngày chọn
          const [from, to] = confirmedRange ?? [null, null];
          reqTuNgay = from ? from.format('YYYY-MM-DD') : todayStr;
          reqDenNgay = to ? to.format('YYYY-MM-DD') : undefined;
          reqTrangThai = 'DA_XAC_NHAN';
        } else if (activeTab === 'TODAY') {
          // Tab 2: TIẾP ĐÓN HÔM NAY -> Chỉ lấy lịch trong ngày hôm nay
          reqTuNgay = todayStr;
          reqDenNgay = todayStr;
          reqTrangThai = statusFilter || undefined;
        } else {
          // Tab 3: TẤT CẢ LỊCH HẸN -> Theo dateFilter và statusFilter tự chọn
          const formattedDate = dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined;
          reqTuNgay = formattedDate;
          reqDenNgay = formattedDate;
          reqTrangThai = statusFilter || undefined;
        }

        const res = await appointmentApi.getPaged({
          pageIndex,
          pageSize,
          keyword: kw?.trim() || undefined,
          trangThai: reqTrangThai,
          tuNgay: reqTuNgay,
          denNgay: reqDenNgay,
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
    [activeTab, keyword, statusFilter, dateFilter, confirmedRange, pageIndex, pageSize, message]
  );

  useEffect(() => {
    fetchAppointments();
    fetchThongKe();
  }, [fetchAppointments, fetchThongKe]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    setPageIndex(1);
    setSelectedAppointment(null);
  };

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
            BS: {r.tenBacSi || 'Chưa gán'}
          </div>
          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>
            {r.soDienThoai || `BN#${r.maBenhNhan}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày / Giờ',
      key: 'timeStatus',
      width: 120,
      render: (_, r) => {
        const apptDate = dayjs(r.thoiGianBatDau);
        const isToday = apptDate.isSame(dayjs(), 'day');
        const isTomorrow = apptDate.isSame(dayjs().add(1, 'day'), 'day');

        let dateDisplay = apptDate.format('DD/MM');
        let dateColor = '#0284c7';
        if (isToday) {
          dateDisplay = 'Hôm nay';
          dateColor = '#16a34a';
        } else if (isTomorrow) {
          dateDisplay = 'Ngày mai';
          dateColor = '#d97706';
        } else if (apptDate.isAfter(dayjs())) {
          dateDisplay = `${apptDate.format('DD/MM')}`;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: dateColor }}>
                {dateDisplay}
              </span>
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
            </div>
            {getStatusBadge(r.trangThai)}
            {r.daThanhToanGiuCho ? (
              <Tag color="blue" style={{ fontSize: 10, margin: 0, padding: '0 4px', lineHeight: '16px' }}>
                100k Cash
              </Tag>
            ) : (
              <Tag color="orange" style={{ fontSize: 10, margin: 0, padding: '0 4px', lineHeight: '16px' }}>
                Chờ thu
              </Tag>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="appointment-container">
      {/* ── TOP KPI STRIP (Interactive Clickable Cards) ── */}
      <div className="appointment-kpi-grid">
        <div
          className="appointment-kpi-card"
          onClick={() => handleTabChange('PENDING')}
          style={{
            cursor: 'pointer',
            borderColor: activeTab === 'PENDING' ? '#f59e0b' : '#e2e8f0',
            background: activeTab === 'PENDING' ? '#fffbeb' : '#ffffff',
          }}
        >
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label" style={{ color: '#d97706' }}>
              Cần duyệt / Chờ thu cọc
            </span>
            <span className="appointment-kpi-value" style={{ color: '#d97706' }}>
              {thongKePending?.choThuTien ?? 0}
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ClockCircleOutlined />
          </div>
        </div>

        <div
          className="appointment-kpi-card"
          onClick={() => {
            setConfirmedRange([dayjs(), dayjs()]);
            handleTabChange('CONFIRMED');
          }}
          style={{
            cursor: 'pointer',
            borderColor: activeTab === 'CONFIRMED' ? '#2563eb' : '#e2e8f0',
            background: activeTab === 'CONFIRMED' ? '#eff6ff' : '#ffffff',
          }}
        >
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Đã giữ chỗ hôm nay</span>
            <span className="appointment-kpi-value" style={{ color: '#2563eb' }}>
              {thongKeToday?.daXacNhan ?? 0}
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div
          className="appointment-kpi-card"
          onClick={() => handleTabChange('TODAY')}
          style={{
            cursor: 'pointer',
            borderColor: activeTab === 'TODAY' ? '#16a34a' : '#e2e8f0',
          }}
        >
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Đã vào khám hôm nay</span>
            <span className="appointment-kpi-value" style={{ color: '#16a34a' }}>
              {thongKeToday?.daTiepNhan ?? 0}
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="appointment-kpi-card">
          <div className="appointment-kpi-info">
            <span className="appointment-kpi-label">Cọc tiền mặt thu hôm nay</span>
            <span className="appointment-kpi-value" style={{ color: '#0284c7', fontSize: 17 }}>
              {(thongKeToday?.tongTienDaThu ?? 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div className="appointment-kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <DollarOutlined />
          </div>
        </div>
      </div>

      {/* ── WORKFLOW TABS & ACTION TOOLBAR ── */}
      <div
        style={{
          background: '#ffffff',
          padding: '4px 14px 0 14px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            style={{ marginBottom: -1, flex: 1 }}
            items={[
              {
                key: 'PENDING',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <ClockCircleOutlined style={{ color: '#d97706' }} />
                    Cần duyệt / Chờ thu cọc
                    <Badge
                      count={thongKePending?.choThuTien ?? 0}
                      overflowCount={99}
                      style={{ backgroundColor: '#f59e0b' }}
                    />
                  </span>
                ),
              },
              {
                key: 'CONFIRMED',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <CheckCircleOutlined style={{ color: '#2563eb' }} />
                    Đã xác nhận / Đã giữ chỗ
                    <Badge
                      count={confirmedCount}
                      overflowCount={99}
                      style={{ backgroundColor: '#2563eb' }}
                    />
                  </span>
                ),
              },
              {
                key: 'TODAY',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <CalendarOutlined style={{ color: '#0284c7' }} />
                    Tiếp đón hôm nay
                    <Badge
                      count={thongKeToday?.tongLichHen ?? 0}
                      overflowCount={99}
                      style={{ backgroundColor: '#0284c7' }}
                    />
                  </span>
                ),
              },
              {
                key: 'ALL',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <SearchOutlined />
                    Tra cứu tất cả lịch hẹn
                  </span>
                ),
              },
            ]}
          />

          <Space style={{ paddingBottom: 8 }}>
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

            {/* Bộ lọc tùy biến theo Tab */}
            {activeTab === 'PENDING' && (
              <div
                style={{
                  fontSize: 11.5,
                  color: '#b45309',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  padding: '5px 8px',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  <strong>Hộp thư duyệt:</strong> Tất cả lịch sắp tới chưa duyệt ({total})
                </span>
                <Tooltip title="Làm mới">
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined style={{ color: '#b45309' }} />}
                    onClick={() => {
                      fetchAppointments();
                      fetchThongKe();
                    }}
                    loading={loading}
                  />
                </Tooltip>
              </div>
            )}

            {activeTab === 'CONFIRMED' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <DatePicker.RangePicker
                    value={confirmedRange}
                    onChange={(range) => {
                      setConfirmedRange(range);
                      setPageIndex(1);
                    }}
                    format="DD/MM/YYYY"
                    size="small"
                    style={{ flex: 1 }}
                    allowEmpty={[false, true]}
                    placeholder={['Từ ngày', 'Đến ngày']}
                    presets={[
                      { label: 'Hôm nay', value: [dayjs(), dayjs()] },
                      { label: 'Ngày mai', value: [dayjs().add(1, 'day'), dayjs().add(1, 'day')] },
                      { label: '7 ngày tới', value: [dayjs(), dayjs().add(7, 'day')] },
                      { label: '30 ngày tới', value: [dayjs(), dayjs().add(30, 'day')] },
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
                <div
                  style={{
                    fontSize: 11.5,
                    color: '#1d4ed8',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '5px 8px',
                    borderRadius: 6,
                  }}
                >
                  <strong>Đã giữ chỗ:</strong> {total} lịch hẹn đã thu cọc, chờ bệnh nhân đến
                </div>
              </div>
            )}

            {activeTab === 'TODAY' && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Tag color="cyan" style={{ margin: 0, fontWeight: 600, flex: 1, textAlign: 'center', padding: '2px 0' }}>
                  Hôm nay: {dayjs().format('DD/MM/YYYY')}
                </Tag>
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
            )}

            {activeTab === 'ALL' && (
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
            )}
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
