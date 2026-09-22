import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Select,
  DatePicker,
  App,
  Tooltip,
} from 'antd';
import {
  ReloadOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  HoaDonListItemDto,
  HoaDonDetailDto,
  TrangThaiHoaDonType,
} from '../types/billing.types';
import { billingApi } from '../api/billing.api';
import { useCoSoOptions } from '../../facility/hook/useCoSoOptions';
import { dateRangePresets } from '../../shared/utils/datePresets';
import InvoiceDetailView from './InvoiceDetailView';
import RecordPaymentModal from './RecordPaymentModal';

const { RangePicker } = DatePicker;

interface InvoiceTableProps {
  initialStatus?: TrangThaiHoaDonType;
}

const statusBadgeConfig: Record<string, { color: string; bg: string; text: string; border: string }> = {
  CHO_THANH_TOAN: {
    color: '#713F12',
    bg: '#FEFCE8',
    text: 'Chờ TT',
    border: '#EAB308',
  },
  THANH_TOAN_MOT_PHAN: {
    color: '#0369A1',
    bg: '#F0F9FF',
    text: 'TT 1 phần',
    border: '#BAE6FD',
  },
  DA_THANH_TOAN: {
    color: '#14532D',
    bg: '#F0FDF4',
    text: 'Đã TT',
    border: '#86EFAC',
  },
  DA_HUY: {
    color: '#374151',
    bg: '#F3F4F6',
    text: 'Đã hủy',
    border: '#D1D5DB',
  },
};

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ initialStatus }) => {
  const { message } = App.useApp();

  const [invoices, setInvoices] = useState<HoaDonListItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  const { coSos } = useCoSoOptions(0);
  const [facilityId, setFacilityId] = useState<number>(0);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string | undefined>(initialStatus);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Split-View selection & detail
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<HoaDonListItemDto | null>(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<HoaDonDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Quick action payment modal
  const [payInvoice, setPayInvoice] = useState<HoaDonListItemDto | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const getRemainingAmount = (invoice: HoaDonListItemDto) =>
    Math.max(0, invoice.soTienConLai ?? (
      (invoice.tongTien || 0) -
      (invoice.soTienBaoHiemChiTra || 0) -
      (invoice.daThanhToan || 0)
    ));

  // KPI calculations
  const kpiStats = useMemo(() => {
    let choThanhToan = 0;
    let daThu = 0;
    let conNo = 0;
    invoices.forEach((i) => {
      if (i.trangThai === 'CHO_THANH_TOAN' || i.trangThai === 'THANH_TOAN_MOT_PHAN') {
        choThanhToan++;
      }
      daThu += i.daThanhToan || 0;
      const no = getRemainingAmount(i);
      if (no > 0 && i.trangThai !== 'DA_HUY') {
        conNo += no;
      }
    });
    return { totalCount: total, choThanhToan, daThu, conNo };
  }, [invoices, total]);

  const loadInvoiceDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await billingApi.getInvoiceById(id);
      if (res.data.success && res.data.data) {
        setSelectedInvoiceDetail(res.data.data);
      } else {
        setSelectedInvoiceDetail(null);
      }
    } catch {
      message.error('Lỗi khi tải dữ liệu chi tiết hóa đơn');
      setSelectedInvoiceDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [message]);

  const fetchInvoices = useCallback(async (searchKw?: string) => {
    setLoading(true);
    try {
      const fromDate = dateRange?.[0] ? dateRange[0].startOf('day').toISOString() : undefined;
      const toDate = dateRange?.[1] ? dateRange[1].endOf('day').toISOString() : undefined;
      const kw = searchKw !== undefined ? searchKw : keyword;

      const res = await billingApi.getInvoices({
        facilityId: facilityId || undefined,
        status: status || undefined,
        keyword: kw?.trim() || undefined,
        fromDate,
        toDate,
        pageIndex,
        pageSize,
      });

      if (res.data.success && res.data.data) {
        const items = res.data.data.items ?? [];
        setInvoices(items);
        setTotal(res.data.data.totalCount ?? items.length);

        // Auto select first item or retain current
        setSelectedInvoiceItem((prev) => {
          if (!prev && items.length > 0) {
            void loadInvoiceDetail(items[0].id);
            return items[0];
          }
          if (prev) {
            const found = items.find((i: HoaDonListItemDto) => i.id === prev.id);
            if (found) {
              void loadInvoiceDetail(found.id);
              return found;
            }
            if (items.length > 0) {
              void loadInvoiceDetail(items[0].id);
              return items[0];
            }
          }
          setSelectedInvoiceDetail(null);
          return null;
        });
      } else {
        message.error(res.data.message || 'Không thể tải danh sách hóa đơn');
      }
    } catch {
      message.error('Lỗi khi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [facilityId, status, keyword, dateRange, pageIndex, pageSize, message, loadInvoiceDetail]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchInvoices(keyword);
  };

  const handleRowClick = (record: HoaDonListItemDto) => {
    setSelectedInvoiceItem(record);
    void loadInvoiceDetail(record.id);
  };

  // Master Table Columns - 5 compact columns fitting in 340px
  const masterColumns: ColumnsType<HoaDonListItemDto> = [
    {
      title: 'Số HĐ',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      width: 72,
      render: (code: string, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          <span
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 700,
              fontSize: 11.5,
              color: '#0F172A',
            }}
          >
            {code}
          </span>
          {(record.trangThai === 'CHO_THANH_TOAN' || record.trangThai === 'THANH_TOAN_MOT_PHAN') && (
            <Tooltip title="Còn khoản phải thu">
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
      title: 'Bệnh nhân',
      key: 'patient',
      ellipsis: true,
      render: (_, r) => (
        <div style={{ lineHeight: 1.25, overflow: 'hidden' }}>
          <Tooltip title={r.tenBenhNhan || `BN #${r.maBenhNhan}`}>
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
              {r.tenBenhNhan || `BN #${r.maBenhNhan}`}
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
            {r.maLuotKham > 0 ? `LK #${r.maLuotKham}` : r.maBenhNhanNoiBo || `Mã: ${r.maBenhNhan}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'ngayLap',
      key: 'ngayLap',
      width: 65,
      render: (val?: string) => {
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
      title: 'Số tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      width: 78,
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
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 60,
      align: 'center',
      render: (status: string) => {
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

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
      {/* ── KHỐI 1: STATUS STRIP (flexShrink: 0) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          padding: '6px 14px',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12.5, color: '#475569' }}>
          <div>
            Tổng: <strong style={{ color: '#0f172a', fontFamily: 'ui-monospace, monospace' }}>{kpiStats.totalCount} hóa đơn</strong>
          </div>
          <span style={{ color: '#d1d5db' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Chờ thu:
            <span style={{ fontWeight: 700, color: '#713F12', background: '#FEFCE8', border: '1px solid #EAB308', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
              {kpiStats.choThanhToan}
            </span>
          </div>
          <span style={{ color: '#d1d5db' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Đã thu (trang này):
            <span style={{ fontWeight: 700, color: '#14532D', background: '#F0FDF4', border: '1px solid #86EFAC', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
              {formatCurrency(kpiStats.daThu)}
            </span>
          </div>
          <span style={{ color: '#d1d5db' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Công nợ cần thu:
            <span style={{ fontWeight: 700, color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
              {formatCurrency(kpiStats.conNo)}
            </span>
          </div>
        </div>

        <Space size="small">
          {selectedInvoiceItem && getRemainingAmount(selectedInvoiceItem) > 0 && selectedInvoiceItem.trangThai !== 'DA_HUY' && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => {
                setPayInvoice(selectedInvoiceItem);
                setPayModalOpen(true);
              }}
              style={{ height: 28, fontSize: 12, fontWeight: 600, background: '#16a34a', borderColor: '#16a34a' }}
            >
              Thu tiền #{selectedInvoiceItem.soHoaDon}
            </Button>
          )}
        </Space>
      </div>

      {/* ── KHỐI 2: SPLIT-VIEW CONTAINER (flex: 1, overflow hidden) ── */}
      <div className="invoice-split-container">
        {/* ══ PHÂN VÙNG MASTER – BÊN TRÁI (~340px) ══ */}
        <div className="invoice-master-panel">
          {/* Filter Toolbar trong Master Panel */}
          <div className="invoice-master-header">
            <Input.Search
              placeholder="Tìm mã HĐ, tên bệnh nhân..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              allowClear
              size="small"
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Select
                placeholder="Cơ sở"
                value={facilityId}
                onChange={(val) => {
                  setFacilityId(val);
                  setPageIndex(1);
                }}
                style={{ flex: 1 }}
                size="small"
                options={[
                  { label: 'Tất cả cơ sở', value: 0 },
                  ...coSos.map((c) => ({ label: c.ten, value: c.id })),
                ]}
              />
              <Select
                placeholder="Trạng thái"
                value={status}
                onChange={(val) => {
                  setStatus(val);
                  setPageIndex(1);
                }}
                style={{ width: 110 }}
                size="small"
                allowClear
                options={[
                  { label: 'Chờ TT', value: 'CHO_THANH_TOAN' },
                  { label: 'TT 1 phần', value: 'THANH_TOAN_MOT_PHAN' },
                  { label: 'Đã TT', value: 'DA_THANH_TOAN' },
                  { label: 'Đã hủy', value: 'DA_HUY' },
                ]}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <RangePicker
                style={{ flex: 1 }}
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null]);
                  setPageIndex(1);
                }}
                format="DD/MM/YY"
                placeholder={['Từ', 'Đến']}
                presets={dateRangePresets}
                size="small"
              />
              <Tooltip title="Tải lại danh sách">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchInvoices()}
                  loading={loading}
                  size="small"
                  className="corporate-action-btn"
                />
              </Tooltip>
            </div>
          </div>

          {/* Master Table – compact, click để chọn dòng */}
          <div className="invoice-master-table-wrapper">
            <Table<HoaDonListItemDto>
              className="invoice-master-table"
              rowKey={(r) => String(r.id)}
              columns={masterColumns}
              dataSource={invoices}
              loading={loading}
              size="small"
              rowClassName={(record) =>
                selectedInvoiceItem?.id === record.id ? 'master-row-selected' : ''
              }
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
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
                },
                showTotal: (t) => `${t} HĐ`,
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: '32px 0', color: '#94a3b8' }}>
                    Không tìm thấy hóa đơn nào
                  </div>
                ),
              }}
            />
          </div>
        </div>

        {/* ══ PHÂN VÙNG DETAIL – BÊN PHẢI (flex-1 min-w-0) ══ */}
        <InvoiceDetailView
          invoice={selectedInvoiceDetail}
          loading={detailLoading}
          onInvoiceUpdated={() => {
            fetchInvoices();
            if (selectedInvoiceItem) {
              void loadInvoiceDetail(selectedInvoiceItem.id);
            }
          }}
          onPaymentSuccess={() => fetchInvoices()}
        />
      </div>

      {/* Direct Payment Modal */}
      <RecordPaymentModal
        open={payModalOpen}
        invoice={payInvoice}
        onClose={() => {
          setPayModalOpen(false);
          setPayInvoice(null);
        }}
        onSuccess={() => {
          fetchInvoices();
          if (selectedInvoiceItem) {
            void loadInvoiceDetail(selectedInvoiceItem.id);
          }
        }}
      />
    </div>
  );
};

export default InvoiceTable;
