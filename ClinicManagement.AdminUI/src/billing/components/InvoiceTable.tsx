import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Input,
  Select,
  DatePicker,
  App,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarOutlined,
  PrinterOutlined,
  FileTextOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  HoaDonListItemDto,
  HoaDonDetailDto,
  TrangThaiHoaDonType,
} from '../types/billing.types';
import { billingApi } from '../api/billing.api';
import InvoiceDetailModal from './InvoiceDetailModal';
import RecordPaymentModal from './RecordPaymentModal';
import InvoicePrintModal from './InvoicePrintModal';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface InvoiceTableProps {
  initialStatus?: TrangThaiHoaDonType;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ initialStatus }) => {
  const { message } = App.useApp();

  const [invoices, setInvoices] = useState<HoaDonListItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string | undefined>(initialStatus);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modals
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [payInvoice, setPayInvoice] = useState<HoaDonListItemDto | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const [printDetail, setPrintDetail] = useState<HoaDonDetailDto | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const fromDate = dateRange?.[0] ? dateRange[0].startOf('day').toISOString() : undefined;
      const toDate = dateRange?.[1] ? dateRange[1].endOf('day').toISOString() : undefined;

      const res = await billingApi.getInvoices({
        facilityId: 1,
        status: status || undefined,
        fromDate,
        toDate,
        pageIndex,
        pageSize,
      });

      if (res.data.success && res.data.data) {
        setInvoices(res.data.data.items ?? []);
        setTotal(res.data.data.totalCount ?? 0);
      } else {
        message.error(res.data.message || 'Không thể tải danh sách hóa đơn');
      }
    } catch {
      message.error('Lỗi khi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [status, dateRange, pageIndex, pageSize, message]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchInvoices();
  };

  const handleReset = () => {
    setKeyword('');
    setStatus(undefined);
    setDateRange(null);
    setPageIndex(1);
  };

  const handleOpenDetail = (id: number) => {
    setSelectedInvoiceId(id);
    setDetailModalOpen(true);
  };

  const handleOpenPay = (record: HoaDonListItemDto) => {
    setPayInvoice(record);
    setPayModalOpen(true);
  };

  const handleOpenPrint = async (id: number) => {
    try {
      const res = await billingApi.getInvoiceById(id);
      if (res.data.success && res.data.data) {
        setPrintDetail(res.data.data);
        setPrintModalOpen(true);
      }
    } catch {
      message.error('Không thể tải thông tin in hóa đơn');
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const getRemainingAmount = (invoice: HoaDonListItemDto) =>
    Math.max(0, invoice.soTienConLai ?? (
      (invoice.tongTien || 0) -
      (invoice.soTienBaoHiemChiTra || 0) -
      (invoice.daThanhToan || 0)
    ));

  const getStatusTag = (st: string) => {
    switch (st) {
      case 'CHO_THANH_TOAN':
        return <Tag color="warning">Chờ thanh toán</Tag>;
      case 'THANH_TOAN_MOT_PHAN':
        return <Tag color="processing">Thanh toán 1 phần</Tag>;
      case 'DA_THANH_TOAN':
        return <Tag color="success">Đã thanh toán</Tag>;
      case 'DA_HUY':
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag>{st}</Tag>;
    }
  };

  // Client-side keyword filter if provided
  const filteredInvoices = useMemo(() => {
    if (!keyword.trim()) return invoices;
    const kw = keyword.trim().toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.soHoaDon?.toLowerCase().includes(kw) ||
        inv.tenBenhNhan?.toLowerCase().includes(kw) ||
        inv.maBenhNhanNoiBo?.toLowerCase().includes(kw)
    );
  }, [invoices, keyword]);

  // KPI calculations
  const kpiStats = useMemo(() => {
    let choThanhToan = 0;
    let daThu = 0;
    let conNo = 0;
    filteredInvoices.forEach((i) => {
      if (i.trangThai === 'CHO_THANH_TOAN' || i.trangThai === 'THANH_TOAN_MOT_PHAN') {
        choThanhToan++;
      }
      daThu += i.daThanhToan || 0;
      const no = getRemainingAmount(i);
      if (no > 0 && i.trangThai !== 'DA_HUY') {
        conNo += no;
      }
    });
    return { choThanhToan, daThu, conNo };
  }, [filteredInvoices]);

  const columns: ColumnsType<HoaDonListItemDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: 'Mã hóa đơn',
      key: 'soHoaDon',
      width: 140,
      render: (_, r) => (
        <a
          onClick={() => handleOpenDetail(r.id)}
          style={{ fontWeight: 600, color: '#0b4f6c' }}
        >
          {r.soHoaDon}
        </a>
      ),
    },
    {
      title: 'Lượt khám',
      key: 'maLuotKham',
      width: 95,
      render: (_, r) => (r.maLuotKham > 0 ? `#${r.maLuotKham}` : '--'),
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => (
        <div>
          <Text strong>{r.tenBenhNhan || `BN #${r.maBenhNhan}`}</Text>
          {r.maBenhNhanNoiBo && (
            <div style={{ fontSize: 11, color: '#8a9fb0' }}>{r.maBenhNhanNoiBo}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Ngày lập',
      key: 'ngayLap',
      width: 105,
      render: (_, r) => formatDate(r.ngayLap),
    },
    {
      title: 'Tổng chi phí',
      dataIndex: 'tongTien',
      key: 'tongTien',
      width: 120,
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'BHYT chi trả',
      dataIndex: 'soTienBaoHiemChiTra',
      key: 'soTienBaoHiemChiTra',
      width: 110,
      align: 'right',
      render: (val) => (val > 0 ? <Text style={{ color: '#0284c7' }}>{formatCurrency(val)}</Text> : '--'),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'daThanhToan',
      key: 'daThanhToan',
      width: 120,
      align: 'right',
      render: (val) => (
        <Text style={{ color: val > 0 ? '#16a34a' : undefined }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Còn nợ',
      key: 'conNo',
      width: 120,
      align: 'right',
      render: (_, r) => {
        const no = getRemainingAmount(r);
        return (
          <Text strong style={{ color: no > 0 && r.trangThai !== 'DA_HUY' ? '#cf1322' : '#64748b' }}>
            {r.trangThai === 'DA_HUY' ? '--' : formatCurrency(no)}
          </Text>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      width: 140,
      align: 'center',
      render: (_, r) => getStatusTag(r.trangThai),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, r) => {
        const no = getRemainingAmount(r);
        const canPay = r.trangThai !== 'DA_HUY' && no > 0;
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetail(r.id)}
              />
            </Tooltip>
            {canPay && (
              <Tooltip title="Thu tiền">
                <Button
                  type="text"
                  size="small"
                  icon={<DollarOutlined style={{ color: '#16a34a' }} />}
                  onClick={() => handleOpenPay(r)}
                />
              </Tooltip>
            )}
            <Tooltip title="In hóa đơn">
              <Button
                type="text"
                size="small"
                icon={<PrinterOutlined />}
                onClick={() => handleOpenPrint(r.id)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* KPI Cards */}
      <div className="billing-kpi-grid">
        <div className="billing-kpi-card">
          <div className="billing-kpi-icon blue">
            <FileTextOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">TỔNG HÓA ĐƠN</div>
            <div className="billing-kpi-value">{total}</div>
          </div>
        </div>

        <div className="billing-kpi-card">
          <div className="billing-kpi-icon orange">
            <ClockCircleOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">CHỜ THANH TOÁN</div>
            <div className="billing-kpi-value">{kpiStats.choThanhToan}</div>
          </div>
        </div>

        <div className="billing-kpi-card">
          <div className="billing-kpi-icon green">
            <CheckCircleOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">TỔNG ĐÃ THU (TRANG NÀY)</div>
            <div className="billing-kpi-value">{formatCurrency(kpiStats.daThu)}</div>
          </div>
        </div>

        <div className="billing-kpi-card">
          <div className="billing-kpi-icon red">
            <ExclamationCircleOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">CÔNG NỢ CẦN THU</div>
            <div className="billing-kpi-value" style={{ color: '#cf1322' }}>
              {formatCurrency(kpiStats.conNo)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <Space wrap size="middle">
          <Input
            placeholder="Tìm theo mã HĐ, tên bệnh nhân..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 250 }}
            allowClear
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          />
          <Select
            placeholder="Trạng thái hóa đơn"
            value={status}
            onChange={(val) => {
              setStatus(val);
              setPageIndex(1);
            }}
            style={{ width: 170 }}
            allowClear
            options={[
              { label: 'Chờ thanh toán', value: 'CHO_THANH_TOAN' },
              { label: 'Thanh toán 1 phần', value: 'THANH_TOAN_MOT_PHAN' },
              { label: 'Đã thanh toán', value: 'DA_THANH_TOAN' },
              { label: 'Đã hủy', value: 'DA_HUY' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null]);
              setPageIndex(1);
            }}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày lập', 'Đến ngày lập']}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleReset}>
            Đặt lại
          </Button>
        </Space>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchInvoices} loading={loading}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Main Table */}
      <Table<HoaDonListItemDto>
        rowKey={(r) => String(r.id)}
        columns={columns}
        dataSource={filteredInvoices}
        loading={loading}
        size="middle"
        pagination={{
          current: pageIndex,
          pageSize,
          total,
          onChange: (page, size) => {
            setPageIndex(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          showTotal: (t, range) =>
            `Hiển thị ${range[0]}–${range[1]} / ${t} hóa đơn`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              Không tìm thấy hóa đơn nào
            </div>
          ),
        }}
      />

      {/* Detail Modal */}
      <InvoiceDetailModal
        open={detailModalOpen}
        invoiceId={selectedInvoiceId}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedInvoiceId(null);
        }}
        onInvoiceUpdated={() => fetchInvoices()}
      />

      {/* Direct Payment Modal */}
      <RecordPaymentModal
        open={payModalOpen}
        invoice={payInvoice}
        onClose={() => {
          setPayModalOpen(false);
          setPayInvoice(null);
        }}
        onSuccess={() => fetchInvoices()}
      />

      {/* Direct Print Modal */}
      <InvoicePrintModal
        open={printModalOpen}
        data={printDetail}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintDetail(null);
        }}
      />
    </div>
  );
};

export default InvoiceTable;
