import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  Tag,
  Space,
  Typography,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
  App,
  Pagination,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PrinterOutlined,
  StopOutlined,
  HolderOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  FileExcelOutlined,
  SyncOutlined,
  UserOutlined,
  TableOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  HoaDonListItemDto,
  HoaDonDetailDto,
  TrangThaiHoaDonType,
} from '../types/billing.types';
import { billingApi } from '../api/billing.api';
import { useCoSoOptions } from '../../facility/hook/useCoSoOptions';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import { dateRangePresets } from '../../shared/utils/datePresets';
import InvoiceDetailModal from './InvoiceDetailModal';
import RecordPaymentModal from './RecordPaymentModal';
import InvoicePrintModal from './InvoicePrintModal';
import CancelInvoiceModal from './CancelInvoiceModal';
import ApplyInsuranceModal from './ApplyInsuranceModal';
import '../../styles/excel-grid.css';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface InvoiceTableProps {
  initialStatus?: TrangThaiHoaDonType;
}

const ALL_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'soHoaDon', label: 'SỐ HÓA ĐƠN', align: 'left' },
  { key: 'maLuotKham', label: 'LƯỢT KHÁM', align: 'center' },
  { key: 'benhNhan', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'coSo', label: 'CƠ SỞ', align: 'left' },
  { key: 'ngayLap', label: 'NGÀY LẬP', align: 'center' },
  { key: 'tongTien', label: 'TỔNG TIỀN', align: 'right' },
  { key: 'baoHiem', label: 'BẢO HIỂM', align: 'right' },
  { key: 'daThanhToan', label: 'ĐÃ THANH TOÁN', align: 'right' },
  { key: 'soTienConLai', label: 'CÒN LẠI (NỢ)', align: 'right' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'actions', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER = [
  'stt',
  'soHoaDon',
  'maLuotKham',
  'benhNhan',
  'coSo',
  'ngayLap',
  'tongTien',
  'baoHiem',
  'daThanhToan',
  'soTienConLai',
  'trangThai',
  'actions',
];

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  stt: 55,
  soHoaDon: 135,
  maLuotKham: 110,
  benhNhan: 220,
  coSo: 140,
  ngayLap: 145,
  tongTien: 135,
  baoHiem: 125,
  daThanhToan: 135,
  soTienConLai: 135,
  trangThai: 140,
  actions: 165,
};

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ initialStatus }) => {
  const { message } = App.useApp();

  const [invoices, setInvoices] = useState<HoaDonListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { coSos } = useCoSoOptions(0);
  const [facilityId, setFacilityId] = useState<number>(0);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(initialStatus);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Column Resizer
  const { colWidths, startColResize, resetColWidths } = useExcelGridResizer(DEFAULT_COL_WIDTHS);

  // Column Reordering
  const [colOrder, setColOrder] = useState<string[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Row Reordering
  const [orderedInvoices, setOrderedInvoices] = useState<HoaDonListItemDto[]>([]);
  const [draggedRowId, setDraggedRowId] = useState<number | null>(null);

  // Modals
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [payInvoice, setPayInvoice] = useState<HoaDonListItemDto | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const [printDetail, setPrintDetail] = useState<HoaDonDetailDto | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const [cancelInvoice, setCancelInvoice] = useState<HoaDonListItemDto | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [insInvoice, setInsInvoice] = useState<HoaDonListItemDto | null>(null);
  const [insModalOpen, setInsModalOpen] = useState(false);

  // Synchronize orderedInvoices when invoices change
  useEffect(() => {
    setOrderedInvoices(invoices);
  }, [invoices]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const getRemainingAmount = (invoice: HoaDonListItemDto) =>
    Math.max(
      0,
      invoice.soTienConLai ??
        (invoice.tongTien || 0) - (invoice.soTienBaoHiemChiTra || 0) - (invoice.daThanhToan || 0)
    );

  // KPI Calculations
  const kpiStats = useMemo(() => {
    let choThanhToan = 0;
    let tongTien = 0;
    let daThu = 0;
    let conNo = 0;

    orderedInvoices.forEach((i) => {
      tongTien += i.tongTien || 0;
      daThu += i.daThanhToan || 0;
      const rem = getRemainingAmount(i);
      if (rem > 0 && i.trangThai !== 'DA_HUY') {
        conNo += rem;
      }
      if (i.trangThai === 'CHO_THANH_TOAN' || i.trangThai === 'THANH_TOAN_MOT_PHAN') {
        choThanhToan++;
      }
    });

    return {
      totalCount,
      tongTien,
      daThu,
      conNo,
      choThanhToan,
    };
  }, [orderedInvoices, totalCount]);

  // Fetch Invoices from API
  const fetchInvoices = useCallback(
    async (searchKw?: string) => {
      setLoading(true);
      try {
        const fromDate = dateRange?.[0] ? dateRange[0].startOf('day').toISOString() : undefined;
        const toDate = dateRange?.[1] ? dateRange[1].endOf('day').toISOString() : undefined;
        const kw = searchKw !== undefined ? searchKw : keyword;

        const res = await billingApi.getInvoices({
          facilityId: facilityId || undefined,
          status: statusFilter || undefined,
          keyword: kw?.trim() || undefined,
          fromDate,
          toDate,
          pageIndex,
          pageSize,
        });

        if (res.data?.success && res.data.data) {
          const items = res.data.data.items ?? [];
          setInvoices(items);
          setTotalCount(res.data.data.totalCount ?? items.length);
        } else {
          setInvoices([]);
          setTotalCount(0);
          message.error(res.data?.message || 'Không thể tải danh sách hóa đơn');
        }
      } catch {
        message.error('Lỗi khi tải danh sách hóa đơn từ hệ thống');
        setInvoices([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [facilityId, statusFilter, keyword, dateRange, pageIndex, pageSize, message]
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchInvoices(keyword);
  };

  // Reset Grid Sizes & Orders
  const handleResetGridSizes = () => {
    resetColWidths();
    setColOrder(DEFAULT_COL_ORDER);
    setOrderedInvoices(invoices);
    message.success('Đã khôi phục kích thước và thứ tự cột về mặc định');
  };

  // Column drag and drop
  const handleColDragStart = (e: React.DragEvent, colKey: string) => {
    if (colKey === 'stt' || colKey === 'actions') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'actions' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt' || targetCol === 'actions') {
      setDraggedCol(null);
      setDragOverCol(null);
      return;
    }
    const newOrder = [...colOrder];
    const fromIdx = newOrder.indexOf(draggedCol);
    const toIdx = newOrder.indexOf(targetCol);
    if (fromIdx !== -1 && toIdx !== -1) {
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggedCol);
      setColOrder(newOrder);
    }
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // Row drag and drop
  const handleRowDragStart = (e: React.DragEvent, id: number) => {
    setDraggedRowId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRowDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetId) {
      setDraggedRowId(null);
      return;
    }
    const current = [...orderedInvoices];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedInvoices(current);
    }
    setDraggedRowId(null);
  };

  // Actions
  const handleOpenDetail = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setDetailModalOpen(true);
  };

  const handleOpenPayment = (record: HoaDonListItemDto) => {
    setPayInvoice(record);
    setPayModalOpen(true);
  };

  const handleOpenPrint = async (record: HoaDonListItemDto) => {
    try {
      setLoading(true);
      const res = await billingApi.getInvoiceById(record.id);
      if (res.data?.success && res.data.data) {
        setPrintDetail(res.data.data);
        setPrintModalOpen(true);
      } else {
        message.error(res.data?.message || 'Không thể tải thông tin in hóa đơn');
      }
    } catch {
      message.error('Lỗi khi tải chi tiết để in hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancel = (record: HoaDonListItemDto) => {
    setCancelInvoice(record);
    setCancelModalOpen(true);
  };

  const handleOpenInsurance = (record: HoaDonListItemDto) => {
    setInsInvoice(record);
    setInsModalOpen(true);
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    if (orderedInvoices.length === 0) {
      message.warning('Không có dữ liệu hóa đơn để xuất');
      return;
    }

    const headers = [
      'STT',
      'Số Hóa Đơn',
      'Mã Lượt Khám',
      'Bệnh Nhân',
      'Mã BN',
      'Ngày Lập',
      'Tổng Tiền (VNĐ)',
      'Bảo Hiểm (VNĐ)',
      'Đã Thanh Toán (VNĐ)',
      'Còn Nợ (VNĐ)',
      'Trạng Thái',
      'Ghi Chú',
    ];

    const rows = orderedInvoices.map((i, idx) => {
      const rem = getRemainingAmount(i);
      const statusMap: Record<string, string> = {
        CHO_THANH_TOAN: 'Chờ thanh toán',
        THANH_TOAN_MOT_PHAN: 'Thanh toán một phần',
        DA_THANH_TOAN: 'Đã thanh toán',
        DA_HUY: 'Đã hủy',
      };
      return [
        (pageIndex - 1) * pageSize + idx + 1,
        `"${i.soHoaDon}"`,
        i.maLuotKham,
        `"${i.tenBenhNhan || ''}"`,
        `"${i.maBenhNhanNoiBo || i.maBenhNhan}"`,
        `"${dayjs(i.ngayLap).format('DD/MM/YYYY HH:mm')}"`,
        i.tongTien,
        i.soTienBaoHiemChiTra || 0,
        i.daThanhToan || 0,
        rem,
        `"${statusMap[i.trangThai] || i.trangThai}"`,
        `"${i.ghiChu || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh_sach_hoa_don_${dayjs().format('YYYYMMDD_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất file hóa đơn thành công!');
  };

  // Render Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CHO_THANH_TOAN':
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />} style={{ fontWeight: 600 }}>
            Chờ TT
          </Tag>
        );
      case 'THANH_TOAN_MOT_PHAN':
        return (
          <Tag color="processing" icon={<SyncOutlined spin />} style={{ fontWeight: 600 }}>
            TT 1 phần
          </Tag>
        );
      case 'DA_THANH_TOAN':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>
            Đã TT
          </Tag>
        );
      case 'DA_HUY':
        return (
          <Tag color="default" icon={<CloseCircleOutlined />} style={{ fontWeight: 600 }}>
            Đã hủy
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Render Cell Content
  const renderCellContent = (colKey: string, record: HoaDonListItemDto, index: number) => {
    const remaining = getRemainingAmount(record);

    switch (colKey) {
      case 'stt':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span title="Kéo thả đổi vị trí dòng" style={{ cursor: 'grab', color: '#94a3b8' }}>
              <HolderOutlined style={{ fontSize: 11 }} />
            </span>
            <span className="font-mono" style={{ fontWeight: 600, color: '#64748b' }}>
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        );

      case 'soHoaDon':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="font-mono font-bold text-slate-900" style={{ fontSize: '12px' }}>
              {record.soHoaDon}
            </span>
            {remaining > 0 && record.trangThai !== 'DA_HUY' && (
              <Tooltip title="Còn khoản phải thu">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#d97706',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            )}
          </div>
        );

      case 'maLuotKham':
        return (
          <span
            className="font-mono font-semibold text-sky-700 hover:underline cursor-pointer"
            onClick={() => handleOpenDetail(record.id)}
            title="Bấm để xem hồ sơ lượt khám"
          >
            LK #{record.maLuotKham}
          </span>
        );

      case 'benhNhan':
        return (
          <div className="cell-truncate">
            <Space size={4} style={{ maxWidth: '100%' }}>
              <UserOutlined style={{ color: '#0b4f6c', fontSize: '11px' }} />
              <Text strong style={{ color: '#0f172a', fontSize: '12px' }} ellipsis>
                {record.tenBenhNhan || `BN #${record.maBenhNhan}`}
              </Text>
            </Space>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }} className="font-mono">
              {record.maBenhNhanNoiBo || `MBN: ${record.maBenhNhan}`}
            </div>
          </div>
        );

      case 'coSo': {
        const coSo = coSos.find((c) => c.id === record.maCoSo);
        return (
          <div className="cell-truncate text-slate-700" title={coSo?.ten || `Cơ sở #${record.maCoSo}`}>
            {coSo?.ten || `Cơ sở #${record.maCoSo}`}
          </div>
        );
      }

      case 'ngayLap': {
        if (!record.ngayLap) return <span style={{ color: '#94a3b8' }}>--</span>;
        const d = dayjs(record.ngayLap);
        return (
          <div className="font-mono" style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{d.format('DD/MM/YYYY')}</div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>{d.format('HH:mm:ss')}</div>
          </div>
        );
      }

      case 'tongTien':
        return (
          <span className="font-mono font-bold text-slate-900" style={{ fontSize: '12px' }}>
            {formatCurrency(record.tongTien)}
          </span>
        );

      case 'baoHiem':
        return (
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono text-slate-700 font-semibold" style={{ fontSize: '11.5px' }}>
              {formatCurrency(record.soTienBaoHiemChiTra || 0)}
            </span>
            {record.mucHuongBHYT !== undefined && record.mucHuongBHYT !== null && record.mucHuongBHYT > 0 && (
              <div style={{ marginTop: 1 }}>
                <Tag
                  color={record.bhytConHan === false ? 'error' : 'blue'}
                  style={{ fontSize: 9.5, margin: 0, padding: '0 4px', lineHeight: '14px' }}
                >
                  {record.mucHuongBHYT}%{record.bhytConHan === false ? ' (Hết hạn)' : ''}
                </Tag>
              </div>
            )}
          </div>
        );

      case 'daThanhToan':
        return (
          <span className="font-mono font-semibold text-emerald-700">
            {formatCurrency(record.daThanhToan || 0)}
          </span>
        );

      case 'soTienConLai':
        return (
          <span
            className={`font-mono font-bold ${
              remaining > 0 && record.trangThai !== 'DA_HUY' ? 'text-rose-600' : 'text-slate-500'
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        );

      case 'trangThai':
        return renderStatusBadge(record.trangThai);

      case 'actions':
        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết hóa đơn">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetail(record.id)}
                style={{ color: '#2563eb' }}
              />
            </Tooltip>

            {record.trangThai !== 'DA_HUY' && (
              <Tooltip title="Áp dụng / Giảm trừ BHYT">
                <Button
                  type="text"
                  size="small"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => handleOpenInsurance(record)}
                  style={{ color: '#0284c7' }}
                />
              </Tooltip>
            )}

            {remaining > 0 && record.trangThai !== 'DA_HUY' && (
              <Tooltip title="Thu tiền hóa đơn">
                <Button
                  type="primary"
                  size="small"
                  icon={<DollarOutlined />}
                  onClick={() => handleOpenPayment(record)}
                  style={{
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a',
                    height: 24,
                    padding: '0 6px',
                    fontSize: 11,
                  }}
                >
                  Thu
                </Button>
              </Tooltip>
            )}

            <Tooltip title="In hóa đơn">
              <Button
                type="text"
                size="small"
                icon={<PrinterOutlined />}
                onClick={() => handleOpenPrint(record)}
                style={{ color: '#475569' }}
              />
            </Tooltip>

            {(record.daThanhToan || 0) === 0 && record.trangThai !== 'DA_HUY' && (
              <Tooltip title="Hủy hóa đơn">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<StopOutlined />}
                  onClick={() => handleOpenCancel(record)}
                />
              </Tooltip>
            )}
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="billing-invoices-excel-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        minHeight: 0,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        backgroundColor: '#f8fafc',
        padding: isFullscreen ? 16 : 0,
      }}
    >
      {/* ── 1. KPI SUMMARY CARDS ── */}
      <div className="billing-kpi-grid">
        <div className="billing-kpi-card">
          <div className="billing-kpi-icon blue">
            <TableOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">Tổng hóa đơn</div>
            <div className="billing-kpi-value font-mono">{kpiStats.totalCount.toLocaleString('vi-VN')}</div>
          </div>
        </div>

        <div className="billing-kpi-card">
          <div className="billing-kpi-icon orange">
            <ClockCircleOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">Chờ thanh toán</div>
            <div className="billing-kpi-value font-mono" style={{ color: '#d97706' }}>
              {kpiStats.choThanhToan} HĐ
            </div>
          </div>
        </div>

        <div className="billing-kpi-card">
          <div className="billing-kpi-icon green">
            <DollarOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">Đã thanh toán (Thực thu)</div>
            <div className="billing-kpi-value font-mono" style={{ color: '#16a34a' }}>
              {formatCurrency(kpiStats.daThu)}
            </div>
          </div>
        </div>

        <div className="billing-kpi-card">
          <div className="billing-kpi-icon red">
            <ExclamationCircleOutlined />
          </div>
          <div>
            <div className="billing-kpi-label">Công nợ cần thu</div>
            <div className="billing-kpi-value font-mono" style={{ color: '#dc2626' }}>
              {formatCurrency(kpiStats.conNo)}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER & ACTION TOOLBAR ── */}
      <Card
        size="small"
        bordered
        style={{
          borderRadius: 8,
          borderColor: '#cbd5e1',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {/* Left search & filter controls */}
          <Space wrap size={8} align="center">
            <Input
              placeholder="Tìm mã HĐ, tên BN, mã BN, mã LK..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 260 }}
              size="middle"
            />

            <Select
              placeholder="Cơ sở"
              value={facilityId}
              onChange={(val) => {
                setFacilityId(val);
                setPageIndex(1);
              }}
              style={{ width: 170 }}
              size="middle"
              options={[
                { label: 'Tất cả cơ sở', value: 0 },
                ...coSos.map((c) => ({ label: c.ten, value: c.id })),
              ]}
            />

            <Select
              placeholder="Trạng thái hóa đơn"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPageIndex(1);
              }}
              style={{ width: 160 }}
              size="middle"
              allowClear
              options={[
                { label: 'Tất cả trạng thái', value: '' },
                { label: 'Chờ thanh toán', value: 'CHO_THANH_TOAN' },
                { label: 'Thanh toán 1 phần', value: 'THANH_TOAN_MOT_PHAN' },
                { label: 'Đã thanh toán', value: 'DA_THANH_TOAN' },
                { label: 'Đã hủy', value: 'DA_HUY' },
              ]}
            />

            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setPageIndex(1);
              }}
              format="DD/MM/YYYY"
              presets={dateRangePresets}
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 230 }}
              size="middle"
            />

            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} size="middle">
              Lọc
            </Button>
          </Space>

          {/* Right action buttons */}
          <Space size={8}>
            <Tooltip title="Xuất danh sách hóa đơn ra file Excel/CSV">
              <Button icon={<FileExcelOutlined />} onClick={handleExportExcel} size="middle">
                Xuất Excel
              </Button>
            </Tooltip>

            <Tooltip title="Khôi phục kích thước và thứ tự cột">
              <Button icon={<TableOutlined />} onClick={handleResetGridSizes} size="middle">
                Đặt lại cỡ ô
              </Button>
            </Tooltip>

            <Tooltip title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}>
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setIsFullscreen(!isFullscreen)}
                size="middle"
              />
            </Tooltip>

            <Tooltip title="Tải lại dữ liệu">
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={() => fetchInvoices()}
                size="middle"
              />
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* ── 3. EXCEL DATA GRID TABLE ── */}
      <div className="excel-grid-container" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <table className="excel-table">
          <colgroup>
            {colOrder.map((colKey) => (
              <col key={colKey} style={{ width: colWidths[colKey] || DEFAULT_COL_WIDTHS[colKey] || 100 }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {colOrder.map((colKey) => {
                const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                if (!colDef) return null;
                const isFixed = colDef.isFixed;
                const isOver = dragOverCol === colKey;

                return (
                  <th
                    key={colKey}
                    className={`excel-th text-${colDef.align} ${isFixed ? 'col-stt' : ''} ${
                      isOver ? 'border-l-2 border-l-blue-600 bg-blue-100' : ''
                    }`}
                    draggable={!isFixed}
                    onDragStart={(e) => handleColDragStart(e, colKey)}
                    onDragOver={(e) => handleColDragOver(e, colKey)}
                    onDrop={(e) => handleColDrop(e, colKey)}
                    style={{
                      width: colWidths[colKey] || DEFAULT_COL_WIDTHS[colKey] || 100,
                      cursor: isFixed ? 'default' : 'move',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          colDef.align === 'center'
                            ? 'center'
                            : colDef.align === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                        gap: 4,
                      }}
                    >
                      {!isFixed && (
                        <HolderOutlined style={{ color: '#94a3b8', fontSize: 10, cursor: 'grab' }} />
                      )}
                      <span className="excel-cell-text">{colDef.label}</span>
                    </div>

                    {/* Resizer Handle */}
                    <div
                      className="col-resizer"
                      onMouseDown={(e) => startColResize(colKey, e)}
                      onClick={(e) => e.stopPropagation()}
                      title="Kéo chuột để chỉnh độ rộng cột"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colOrder.length} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Space direction="vertical" align="center">
                    <SyncOutlined spin style={{ fontSize: 24, color: '#2563eb' }} />
                    <span style={{ color: '#64748b', fontSize: 12 }}>Đang tải danh sách hóa đơn...</span>
                  </Space>
                </td>
              </tr>
            ) : orderedInvoices.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ color: '#94a3b8' }}>Không tìm thấy hóa đơn nào phù hợp</div>
                </td>
              </tr>
            ) : (
              orderedInvoices.map((record, index) => (
                <tr
                  key={record.id}
                  className="excel-row"
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, record.id)}
                  onDragOver={handleRowDragOver}
                  onDrop={(e) => handleRowDrop(e, record.id)}
                  style={{
                    backgroundColor: draggedRowId === record.id ? '#eff6ff' : undefined,
                  }}
                >
                  {colOrder.map((colKey) => (
                    <td
                      key={colKey}
                      className={`excel-td ${colKey === 'stt' ? 'col-stt' : ''}`}
                      style={{
                        textAlign: ALL_COLUMNS.find((c) => c.key === colKey)?.align as any,
                      }}
                    >
                      {renderCellContent(colKey, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. PAGINATION FOOTER ── */}
      <Card
        size="small"
        bordered
        style={{
          borderRadius: 8,
          borderColor: '#cbd5e1',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Hiển thị{' '}
            <strong style={{ color: '#0f172a' }}>
              {totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1} -{' '}
              {Math.min(pageIndex * pageSize, totalCount)}
            </strong>{' '}
            trên tổng số <strong style={{ color: '#0f172a' }}>{totalCount.toLocaleString('vi-VN')}</strong>{' '}
            hóa đơn
          </div>

          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={totalCount}
            size="small"
            showSizeChanger
            pageSizeOptions={['10', '20', '50', '100']}
            onChange={(page, size) => {
              setPageIndex(page);
              setPageSize(size);
            }}
          />
        </div>
      </Card>

      {/* ── 5. ACTION MODALS ── */}
      {/* 5.1 Chi tiết hóa đơn */}
      <InvoiceDetailModal
        open={detailModalOpen}
        invoiceId={selectedInvoiceId}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedInvoiceId(null);
        }}
        onInvoiceUpdated={() => fetchInvoices()}
      />

      {/* 5.2 Thu tiền hóa đơn */}
      <RecordPaymentModal
        open={payModalOpen}
        invoice={payInvoice}
        onClose={() => {
          setPayModalOpen(false);
          setPayInvoice(null);
        }}
        onSuccess={() => {
          fetchInvoices();
          message.success('Đã ghi nhận thanh toán thành công');
        }}
      />

      {/* 5.3 In hóa đơn */}
      <InvoicePrintModal
        open={printModalOpen}
        data={printDetail}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintDetail(null);
        }}
      />

      {/* 5.4 Hủy hóa đơn */}
      <CancelInvoiceModal
        open={cancelModalOpen}
        invoice={cancelInvoice}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelInvoice(null);
        }}
        onSuccess={() => {
          fetchInvoices();
          message.success('Hóa đơn đã được hủy');
        }}
      />

      {/* 5.5 Áp dụng BHYT & Giảm trừ viện phí */}
      <ApplyInsuranceModal
        open={insModalOpen}
        invoice={insInvoice}
        onClose={() => {
          setInsModalOpen(false);
          setInsInvoice(null);
        }}
        onSuccess={() => {
          fetchInvoices();
        }}
      />
    </div>
  );
};

export default InvoiceTable;
