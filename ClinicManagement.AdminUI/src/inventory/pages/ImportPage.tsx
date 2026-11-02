import React, { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Table,
  Space,
  Typography,
  App,
  Tooltip,
  Input,
  Select,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { inventoryApi } from '../api/inventory.api';
import {
  ImportReceiptDto,
  ImportReceiptRequest,
  ImportReceiptStatus,
} from '../types/inventory.types';
import ImportReceiptForm from '../components/ImportReceiptForm';
import ImportDetailView from '../components/ImportDetailView';
import ImportFromPOModal from '../components/ImportFromPOModal';
import { dateRangePresets } from '../../shared/utils/datePresets';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Bảng màu trạng thái Muted chuẩn y tế / doanh nghiệp B2B
const statusBadgeConfig: Record<
  ImportReceiptStatus,
  { color: string; bg: string; text: string; border: string }
> = {
  CHO_DUYET: {
    color: '#713F12',
    bg: '#FEFCE8',
    text: 'Chờ duyệt',
    border: '#EAB308',
  },
  DA_NHAP: {
    color: '#14532D',
    bg: '#F0FDF4',
    text: 'Đã nhập',
    border: '#86EFAC',
  },
  DA_HUY: {
    color: '#374151',
    bg: '#F3F4F6',
    text: 'Đã hủy',
    border: '#D1D5DB',
  },
  TAM: {
    color: '#0369a1',
    bg: '#f0f9ff',
    text: 'Nháp tạm',
    border: '#bae6fd',
  },
};

export const ImportPage: React.FC = () => {
  const { message } = App.useApp();

  // Form modal tạo / sửa phiếu
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<ImportReceiptDto | null>(null);
  const [poImportModalOpen, setPoImportModalOpen] = useState(false);

  // Phiếu nhập đang được chọn trong Split-View (Detail Panel)
  const [selectedReceipt, setSelectedReceipt] = useState<ImportReceiptDto | null>(null);

  // Danh sách phiếu nhập & phân trang
  const [receipts, setReceipts] = useState<ImportReceiptDto[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Bộ lọc nhanh
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ImportReceiptStatus | 'all'>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | 'all'>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Thao tác duyệt / hủy
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Tải danh sách phiếu nhập từ API
  const loadReceipts = async (pIndex = pageIndex, pSize = pageSize) => {
    setListLoading(true);
    try {
      const params: any = { pageIndex: pIndex, pageSize: pSize };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (dateRange && dateRange[0]) params.fromDate = dateRange[0].startOf('day').toISOString();
      if (dateRange && dateRange[1]) params.toDate = dateRange[1].endOf('day').toISOString();

      const res = await inventoryApi.getImportReceipts(params);
      if (res.data.success) {
        let items = res.data.data.items || [];
        if (selectedWarehouse !== 'all') {
          items = items.filter((r) => r.warehouse?.id === selectedWarehouse);
        }
        setReceipts(items);
        setTotal(res.data.data.total || items.length);

        // Tự động chọn dòng đầu tiên hoặc duy trì phiếu đang xem
        setSelectedReceipt((prev) => {
          if (!prev) return items.length > 0 ? items[0] : null;
          const found = items.find((r: ImportReceiptDto) => r.id === prev.id);
          return found || (items.length > 0 ? items[0] : null);
        });
      } else {
        message.error(res.data.message || 'Không tải được danh sách phiếu nhập');
      }
    } catch {
      message.error('Có lỗi khi tải danh sách phiếu nhập kho');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void loadReceipts(1, pageSize);
    setPageIndex(1);
  }, [selectedStatus, selectedWarehouse, dateRange]);

  const handleSearch = () => {
    void loadReceipts(1, pageSize);
    setPageIndex(1);
  };

  // Tính toán nhanh số liệu KPI từ danh sách (Dải thống kê thanh ngang)
  const kpiStats = useMemo(() => {
    const totalCount = total;
    const pendingCount = receipts.filter((r) => r.status === 'CHO_DUYET').length;
    const importedCount = receipts.filter((r) => r.status === 'DA_NHAP').length;
    const canceledCount = receipts.filter((r) => r.status === 'DA_HUY').length;
    const totalValue = receipts.reduce(
      (sum, r) => (r.status !== 'DA_HUY' ? sum + (r.totalAmount || 0) : sum),
      0,
    );
    return { totalCount, pendingCount, importedCount, canceledCount, totalValue };
  }, [receipts, total]);

  // Xử lý tạo mới hoặc cập nhật phiếu
  const handleCreateOrUpdate = async (data: ImportReceiptRequest, id?: number) => {
    setFormLoading(true);
    try {
      if (id) {
        const res = await inventoryApi.updateImportReceipt(id, data);
        if (res.data.success) {
          message.success(`Đã cập nhật thành công phiếu nhập #${id}`);
          setFormOpen(false);
          setEditingReceipt(null);
          await loadReceipts();
        } else {
          message.error(res.data.message || 'Cập nhật phiếu nhập thất bại');
        }
      } else {
        const res = await inventoryApi.createImportReceipt(data);
        if (res.data.success) {
          const newReceipt = res.data.data;
          message.success(
            data.saveDraft
              ? `Đã lưu nháp phiếu nhập #${newReceipt.id}`
              : `Đã nhập kho thành công cho phiếu #${newReceipt.id}`,
          );
          setFormOpen(false);
          setEditingReceipt(null);
          await loadReceipts();
        } else {
          message.error(res.data.message || 'Tạo phiếu nhập thất bại');
        }
      }
    } catch {
      message.error('Có lỗi xảy ra khi lưu phiếu nhập kho');
    } finally {
      setFormLoading(false);
    }
  };

  // Xử lý Duyệt phiếu nhập kho (GPP)
  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      const res = await inventoryApi.approveImport(id);
      if (res.data.success) {
        setReceipts((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'DA_NHAP' as const } : r)),
        );
        if (selectedReceipt && selectedReceipt.id === id) {
          setSelectedReceipt((prev) =>
            prev ? { ...prev, status: 'DA_NHAP' as const } : null,
          );
        }
        message.success(`Đã duyệt nhập kho thành công cho phiếu #${id}`);
        await loadReceipts();
      } else {
        message.error(res.data.message || 'Duyệt phiếu thất bại');
      }
    } catch {
      message.error('Có lỗi khi duyệt phiếu nhập kho');
    } finally {
      setApprovingId(null);
    }
  };

  // Xử lý Hủy phiếu nhập kho
  const handleCancel = async (id: number, reason?: string) => {
    setCancelingId(id);
    try {
      const res = await inventoryApi.cancelImportReceipt(id, reason || cancelReason);
      if (res.data.success) {
        setReceipts((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'DA_HUY' as const } : r)),
        );
        if (selectedReceipt && selectedReceipt.id === id) {
          setSelectedReceipt((prev) =>
            prev ? { ...prev, status: 'DA_HUY' as const } : null,
          );
        }
        message.success(`Đã hủy phiếu nhập #${id}`);
        setCancelReason('');
        await loadReceipts();
      } else {
        message.error(res.data.message || 'Hủy phiếu thất bại');
      }
    } catch {
      message.error('Có lỗi khi hủy phiếu nhập kho');
    } finally {
      setCancelingId(null);
    }
  };

  const formatCurrency = (amount: number) =>
    (amount ?? 0).toLocaleString('vi-VN') + ' đ';

  // Master Table: 5 cột nhỏ gọn, vừa vặn tuyệt đối trong khung 340px
  const masterColumns: ColumnsType<ImportReceiptDto> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 58,
      render: (id: number, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          <span
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 700,
              fontSize: 11.5,
              color: '#0F172A',
            }}
          >
            #{id}
          </span>
          {record.status === 'CHO_DUYET' && (
            <Tooltip title="Chờ duyệt nhập kho">
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#D97706',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'NCC / Số HĐ',
      dataIndex: 'supplier',
      key: 'supplier',
      ellipsis: true,
      render: (_, record) => (
        <div style={{ lineHeight: 1.25, overflow: 'hidden' }}>
          <Tooltip title={record.supplier?.name || '--'}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 11.5,
                color: '#111827',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.supplier?.name || '--'}
            </div>
          </Tooltip>
          <div
            style={{
              fontSize: 10.5,
              color: '#6B7280',
              fontFamily: 'ui-monospace, monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: 1,
            }}
          >
            {record.referenceCode
              ? `HĐ: ${record.referenceCode}`
              : record.supplier?.code
                ? `Mã: ${record.supplier.code}`
                : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      width: 68,
      render: (val?: string | null) => {
        if (!val) return <span style={{ color: '#9CA3AF', fontSize: 10.5 }}>--</span>;
        const d = new Date(val);
        return (
          <div style={{ lineHeight: 1.15, whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace' }}>
            <div style={{ fontSize: 11, color: '#111827', fontWeight: 500 }}>
              {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </div>
            <div style={{ fontSize: 10, color: '#6B7280' }}>
              {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tiền (đ)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 82,
      align: 'right',
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
            fontSize: 11,
            color: '#0F172A',
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'TT',
      dataIndex: 'status',
      key: 'status',
      width: 60,
      align: 'center',
      render: (status: ImportReceiptStatus) => {
        const cfg = statusBadgeConfig[status] ?? {
          color: '#374151', bg: '#F3F4F6', text: status, border: '#D1D5DB',
        };
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '1px 4px',
              borderRadius: 3,
              fontSize: 10,
              fontWeight: 600,
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.text}
          </span>
        );
      },
    },
  ];

  // Khi mở form tạo / sửa phiếu: hiển thị giao diện Toàn Màn Hình
  if (formOpen) {
    return (
      <ImportReceiptForm
        open={formOpen}
        loading={formLoading}
        initialData={editingReceipt}
        onSubmit={handleCreateOrUpdate}
        onCancel={() => {
          setFormOpen(false);
          setEditingReceipt(null);
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 112px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflow: 'hidden',
      }}
    >
      {/* ── KHỐI 1: HEADER + STATUS STRIP (flexShrink: 0) ── */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Tiêu đề & Nút hành động */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              QUẢN LÝ NHẬP KHO DƯỢC & VẬT TƯ
            </Title>
            <Text style={{ color: '#64748b', fontSize: 11.5 }}>
              Master – Detail View • Đối soát chứng từ, danh mục thuốc và kiểm duyệt kho y tế chuẩn GPP
            </Text>
          </div>

          <Space size="small">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setPoImportModalOpen(true)}
              className="corporate-action-btn"
              style={{ height: 30, padding: '0 12px', fontSize: 12, fontWeight: 500 }}
            >
              Nhập từ Đơn PO
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingReceipt(null); setFormOpen(true); }}
              style={{ height: 30, padding: '0 14px', fontSize: 12, fontWeight: 600, background: '#0284c7', borderColor: '#0284c7' }}
            >
              Tạo phiếu nhập mới
            </Button>
          </Space>
        </div>

        {/* Corporate Status Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            padding: '5px 14px',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12.5, color: '#475569' }}>
            <div>
              Tổng: <strong style={{ color: '#0f172a', fontFamily: 'ui-monospace, monospace' }}>{kpiStats.totalCount} phiếu</strong>
            </div>
            <span style={{ color: '#d1d5db' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Chờ duyệt:
              <span style={{ fontWeight: 700, color: '#713F12', background: '#FEFCE8', border: '1px solid #EAB308', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
                {kpiStats.pendingCount}
              </span>
            </div>
            <span style={{ color: '#d1d5db' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Đã nhập:
              <span style={{ fontWeight: 700, color: '#14532D', background: '#F0FDF4', border: '1px solid #86EFAC', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
                {kpiStats.importedCount}
              </span>
            </div>
            <span style={{ color: '#d1d5db' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Đã hủy:
              <span style={{ fontWeight: 600, color: '#374151', background: '#F3F4F6', border: '1px solid #D1D5DB', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
                {kpiStats.canceledCount}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#64748b', fontSize: 12.5 }}>Tổng giá trị nhập:</span>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
              {formatCurrency(kpiStats.totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* ── KHỐI 2: SPLIT-VIEW CONTAINER (flex: 1, overflow hidden) ── */}
      <div className="import-split-container">

        {/* ══ PHÂN VÙNG MASTER – BÊN TRÁI (42%) ══ */}
        <div className="import-master-panel">

          {/* Filter Toolbar trong Master Panel (vừa vặn 340px) */}
          <div className="import-master-header">
            <Input.Search
              placeholder="Tìm mã, HĐ, NCC..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              allowClear
              size="small"
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Select
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                style={{ flex: 1 }}
                size="small"
                options={[
                  { value: 'all', label: 'Tất cả TT' },
                  { value: 'CHO_DUYET', label: 'Chờ duyệt' },
                  { value: 'DA_NHAP', label: 'Đã nhập' },
                  { value: 'DA_HUY', label: 'Đã hủy' },
                ]}
              />
              <RangePicker
                style={{ width: 175 }}
                format="DD/MM/YY"
                placeholder={['Từ', 'Đến']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as any)}
                presets={dateRangePresets}
                size="small"
              />
              <Tooltip title="Tải lại danh sách">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => void loadReceipts()}
                  loading={listLoading}
                  size="small"
                  className="corporate-action-btn"
                />
              </Tooltip>
            </div>
          </div>

          {/* Master Table – compact, click để chọn dòng */}
          <div className="import-master-table-wrapper">
            <Table<ImportReceiptDto>
              className="import-master-table"
              rowKey="id"
              columns={masterColumns}
              dataSource={receipts}
              loading={listLoading}
              size="small"
              rowClassName={(record) =>
                selectedReceipt?.id === record.id ? 'master-row-selected' : ''
              }
              onRow={(record) => ({
                onClick: () => setSelectedReceipt(record),
                style: { cursor: 'pointer' },
              })}
              pagination={{
                current: pageIndex,
                pageSize,
                total,
                size: 'small',
                showSizeChanger: true,
                pageSizeOptions: ['15', '30', '50'],
                onChange: (page, size) => {
                  setPageIndex(page);
                  setPageSize(size);
                  void loadReceipts(page, size);
                },
                showTotal: (t) => `${t} phiếu`,
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: '32px 0', color: '#94a3b8' }}>
                    <MedicineBoxOutlined style={{ fontSize: 24, display: 'block', marginBottom: 6 }} />
                    Chưa có phiếu nhập phù hợp.
                  </div>
                ),
              }}
            />
          </div>
        </div>

        {/* ══ PHÂN VÙNG DETAIL – BÊN PHẢI (58%) ══ */}
        <ImportDetailView
          receipt={selectedReceipt}
          onApprove={handleApprove}
          onCancelReceipt={handleCancel}
          onEdit={(rec) => {
            setEditingReceipt(rec);
            setFormOpen(true);
          }}
          approving={Boolean(selectedReceipt && approvingId === selectedReceipt.id)}
          canceling={Boolean(selectedReceipt && cancelingId === selectedReceipt.id)}
        />
      </div>

      {/* Modal nhập kho từ đơn đặt hàng PO */}
      <ImportFromPOModal
        open={poImportModalOpen}
        onClose={() => setPoImportModalOpen(false)}
        onSuccess={() => { void loadReceipts(); }}
      />
    </div>
  );
};

export default ImportPage;
