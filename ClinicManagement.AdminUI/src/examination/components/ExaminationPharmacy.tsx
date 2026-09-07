import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Tag,
  Select,
  Button,
  Space,
  Typography,
  Tooltip,
  Modal,
  Alert,
  App,
} from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AlertOutlined,
  EyeOutlined,
  CheckOutlined,
  DeleteOutlined,
  ShopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useExamination } from '../hook/useExamination';
import ActionBar, { ActionItem } from '../../shared/components/layouts/components/ActionBar';
import { DonThuocListDto } from '../type/prescription.examination.type';

const { Text } = Typography;

const ExaminationPharmacy: React.FC = () => {
  const { message } = App.useApp();
  const {
    donThuocList,
    donThuocTotal,
    thongKeDonThuoc,
    loadingDonThuoc,
    loadingThongKeDonThuoc,
    fetchDonThuocList,
    fetchThongKeDonThuoc,
    khoas,
    filters,
  } = useExamination();

  // State bộ lọc
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State cho ActionBar
  const [selectedDonThuoc, setSelectedDonThuoc] = useState<DonThuocListDto | null>(null);
  const [showActionBar, setShowActionBar] = useState(false);

  // Hàm xử lý click vào dòng
  const handleRowClick = (item: DonThuocListDto) => {
    setSelectedDonThuoc(item);
    setShowActionBar(true);
  };

  // Đóng ActionBar
  const handleCloseActionBar = () => {
    setShowActionBar(false);
    setSelectedDonThuoc(null);
  };

  const handleApprovePrescription = (id: number | string) => {
    Modal.confirm({
      title: 'Xác nhận duyệt đơn thuốc?',
      content: `Duyệt cấp phát cho đơn thuốc #${id}?`,
      okText: 'Duyệt đơn',
      onOk: () => {
        message.success(`Đã duyệt đơn thuốc #${id}`);
      },
    });
  };

  const handleDispenseMedicine = (id: number | string) => {
    message.success(`Đã xuất kho thuốc cho đơn #${id}`);
  };

  const handleCancelPrescription = (id: number | string) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn thuốc?',
      content: `Bạn có chắc muốn hủy đơn thuốc #${id}?`,
      okText: 'Hủy đơn',
      okType: 'danger',
      onOk: () => {
        message.info(`Đã hủy đơn thuốc #${id}`);
      },
    });
  };

  // Các hành động cho đơn thuốc
  const donThuocActions: ActionItem[] = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary',
      onClick: (id) => {
        message.info(`Xem chi tiết đơn thuốc #${id}`);
      },
    },
    {
      label: 'Duyệt đơn',
      icon: 'check',
      color: 'success',
      onClick: handleApprovePrescription,
    },
    {
      label: 'Xuất thuốc',
      icon: 'truck',
      color: 'info',
      onClick: handleDispenseMedicine,
    },
    {
      label: 'Hủy',
      icon: 'trash',
      color: 'danger',
      onClick: handleCancelPrescription,
    },
  ];

  // Tải danh sách đơn thuốc
  useEffect(() => {
    fetchDonThuocList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter || filters.maKhoa,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, statusFilter, filters.maKhoa, fetchDonThuocList]);

  // Tải thống kê
  useEffect(() => {
    fetchThongKeDonThuoc({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
  }, [filters.maCoSo, filters.maKhoa, fetchThongKeDonThuoc]);

  // Xây dựng KPI
  const kpis = useMemo(() => {
    return [
      {
        label: 'Tổng đơn thuốc',
        value: thongKeDonThuoc?.tongDonThuoc ?? 0,
        color: '#0b4f6c',
        bgColor: '#e8f4f7',
        icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#0b4f6c' }} />,
      },
      {
        label: 'Đơn tạm',
        value: thongKeDonThuoc?.tam ?? 0,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b' }} />,
      },
      {
        label: 'Đã duyệt',
        value: thongKeDonThuoc?.daDuyet ?? 0,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#0284c7' }} />,
      },
      {
        label: 'Đã xuất hết',
        value: thongKeDonThuoc?.daXuatHet ?? 0,
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} />,
      },
      {
        label: 'Đã hủy',
        value: thongKeDonThuoc?.daHuy ?? 0,
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: <CloseCircleOutlined style={{ fontSize: 20, color: '#ef4444' }} />,
      },
      {
        label: 'Tồn kho cảnh báo',
        value: '2 mặt hàng',
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        icon: <ShopOutlined style={{ fontSize: 20, color: '#8b5cf6' }} />,
        isText: true,
      },
    ];
  }, [thongKeDonThuoc]);

  const formatCurrency = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const columns: ColumnsType<DonThuocListDto> = [
    {
      title: 'Bệnh nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
      render: (text) => <Text strong style={{ color: '#0b4f6c' }}>{text}</Text>,
    },
    {
      title: 'Khoa',
      dataIndex: 'tenKhoa',
      key: 'tenKhoa',
      width: 140,
    },
    {
      title: 'Bác sĩ kê',
      dataIndex: 'tenBacSi',
      key: 'tenBacSi',
      width: 160,
    },
    {
      title: 'Số loại',
      dataIndex: 'soLuongThuoc',
      key: 'soLuongThuoc',
      width: 90,
      align: 'center',
      render: (count) => <Tag color="blue">{count} loại</Tag>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      width: 130,
      align: 'right',
      render: (val: number) => <Text strong>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Ngày kê',
      dataIndex: 'ngayKe',
      key: 'ngayKe',
      width: 110,
      render: formatDate,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (status: string) => {
        switch (status) {
          case 'TAM':
            return <Tag color="warning">Tạm</Tag>;
          case 'DA_DUYET':
            return <Tag color="processing">Đã duyệt</Tag>;
          case 'DA_XUAT_HET':
            return <Tag color="success">Đã xuất</Tag>;
          case 'HUY':
            return <Tag color="default">Đã hủy</Tag>;
          default:
            return <Tag color="default">{status || 'Tạm'}</Tag>;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleRowClick(record)}
            />
          </Tooltip>
          {record.trangThai === 'TAM' && (
            <Tooltip title="Duyệt đơn thuốc">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined style={{ color: '#10b981' }} />}
                onClick={() => handleApprovePrescription(record.id)}
              />
            </Tooltip>
          )}
          {record.trangThai === 'DA_DUYET' && (
            <Tooltip title="Xuất thuốc">
              <Button
                type="text"
                size="small"
                icon={<ShopOutlined style={{ color: '#0284c7' }} />}
                onClick={() => handleDispenseMedicine(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Hủy đơn">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleCancelPrescription(record.id)}
            />
          </Tooltip>
        </Space>
      ),
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
      {!isFullscreen && (
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
      )}

      {/* Main Split Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        {/* Left Pane: Prescription Grid */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Integrated Control Toolbar */}
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
                <MedicineBoxOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
                <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
                  Danh sách đơn thuốc & cấp phát
                </Text>
              </Space>
              <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
                {donThuocTotal} đơn
              </Tag>
            </Space>

            <Space wrap size="small">
              <Select
                placeholder="Tất cả trạng thái"
                value={statusFilter || undefined}
                onChange={(val) => {
                  setStatusFilter(val || '');
                  setPageIndex(1);
                }}
                allowClear
                style={{ width: 145 }}
                size="middle"
                options={[
                  { value: 'TAM', label: 'Tạm' },
                  { value: 'DA_DUYET', label: 'Đã duyệt' },
                  { value: 'DA_XUAT_HET', label: 'Đã xuất' },
                  { value: 'HUY', label: 'Đã hủy' },
                ]}
              />
              <Select
                placeholder="Tất cả khoa"
                value={khoaFilter}
                onChange={(val) => {
                  setKhoaFilter(val);
                  setPageIndex(1);
                }}
                allowClear
                style={{ width: 160 }}
                size="middle"
                options={khoas.map((k) => ({ value: k.id, label: k.ten }))}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchDonThuocList({
                    pageIndex,
                    pageSize,
                    maKhoa: khoaFilter || filters.maKhoa,
                    trangThai: statusFilter || undefined,
                  })
                }
                size="middle"
              >
                Tải lại
              </Button>
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setIsFullscreen(!isFullscreen)}
                size="middle"
              >
                {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              </Button>
            </Space>
          </div>

          {/* Edge-to-Edge Data Grid */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Table<DonThuocListDto>
              rowKey="id"
              columns={columns}
              dataSource={donThuocList}
              loading={loadingDonThuoc}
              size="middle"
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: {
                  cursor: 'pointer',
                  background: selectedDonThuoc?.id === record.id ? '#e8f4f7' : undefined,
                },
              })}
              pagination={{
                current: pageIndex,
                pageSize: pageSize,
                total: donThuocTotal,
                onChange: (page, size) => {
                  setPageIndex(page);
                  setPageSize(size);
                },
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total, range) => `Hiển thị ${range[0]} - ${range[1]} / ${total} đơn`,
                style: { padding: '8px 16px', margin: 0 },
              }}
              scroll={{ y: 'calc(100vh - 235px)' }}
            />
          </div>
        </div>

        {/* Right Pane: Docked Stock Warning Panel */}
        {!isFullscreen && (
          <div
            style={{
              width: 320,
              minWidth: 320,
              borderLeft: '1px solid #e2e8f0',
              background: '#fafbfc',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                height: 46,
                minHeight: 46,
                padding: '0 16px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <Space size="small">
                <AlertOutlined style={{ color: '#ef4444' }} />
                <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                  Cảnh báo tồn kho dược
                </Text>
              </Space>
              <Tag color="red" style={{ margin: 0 }}>
                2 loại
              </Tag>
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
              <Alert
                type="error"
                showIcon
                message="Paracetamol 500mg"
                description="Còn 20 viên trong kho, dưới ngưỡng an toàn (50 viên)."
              />
              <Alert
                type="warning"
                showIcon
                message="Amoxicillin 250mg"
                description="Lô hàng HSD-2026 sắp hết hạn trong 3 ngày tới."
              />
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <Button type="link" style={{ padding: 0, color: '#0b4f6c' }}>
                  Quản lý kho dược →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ActionBar */}
      <ActionBar
        isVisible={showActionBar}
        onClose={handleCloseActionBar}
        selectedId={selectedDonThuoc?.id}
        actions={donThuocActions}
        title="Đơn thuốc"
        entityName={selectedDonThuoc?.tenBenhNhan || 'bản ghi'}
      />
    </div>
  );
};

export default ExaminationPharmacy;