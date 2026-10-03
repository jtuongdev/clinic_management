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
  Modal,
  Form,
  InputNumber,
  Tooltip,
  App,
  Pagination,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  HistoryOutlined,
  ShopOutlined,
  FileTextOutlined,
  HolderOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  CongNoNhaCungCapDto,
  TongQuanCongNoNhaCungCapDto,
  LichSuThanhToanNhaCungCapDto,
  ThanhToanCongNoNhaCungCapRequest,
} from '../types/billing.types';
import { billingApi } from '../api/billing.api';
import { inventoryApi } from '../../inventory/api/inventory.api';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const ALL_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'maPhieuNhap', label: 'MÃ PHIẾU NHẬP', align: 'left' },
  { key: 'nhaCungCap', label: 'NHÀ CUNG CẤP', align: 'left' },
  { key: 'dates', label: 'NGÀY NHẬP / HẠN TT', align: 'left' },
  { key: 'tongTien', label: 'TỔNG TIỀN PHIẾU', align: 'right' },
  { key: 'soTienDaTra', label: 'ĐÃ THANH TOÁN', align: 'right' },
  { key: 'soTienConLai', label: 'CÒN NỢ', align: 'right' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'actions', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER = [
  'stt',
  'maPhieuNhap',
  'nhaCungCap',
  'dates',
  'tongTien',
  'soTienDaTra',
  'soTienConLai',
  'trangThai',
  'actions',
];

export const SupplierDebtsTable: React.FC = () => {

  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [debts, setDebts] = useState<CongNoNhaCungCapDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resizer
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 55,
    maPhieuNhap: 150,
    nhaCungCap: 240,
    dates: 180,
    tongTien: 140,
    soTienDaTra: 140,
    soTienConLai: 140,
    trangThai: 140,
    actions: 160,
  });

  // Column Reordering
  const [colOrder, setColOrder] = useState<string[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

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

  // Row reordering
  const [orderedDebts, setOrderedDebts] = useState<CongNoNhaCungCapDto[]>([]);
  const [draggedRowId, setDraggedRowId] = useState<number | null>(null);

  useEffect(() => {
    setOrderedDebts(debts);
  }, [debts]);

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
    const current = [...orderedDebts];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedDebts(current);
    }
    setDraggedRowId(null);
  };

  // Summary KPIs
  const [summary, setSummary] = useState<TongQuanCongNoNhaCungCapDto>({
    tongCongNo: 0,
    tongNoQuaHan: 0,
    tongDaThanhToan: 0,
    soPhieuChuaThanhToan: 0,
    soPhieuQuaHan: 0,
    soNhaCungCapConNo: 0,
    tongSoPhieu: 0,
  });

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Supplier options for filter dropdown
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: number }[]>([]);

  // Modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<CongNoNhaCungCapDto | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm] = Form.useForm();

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedDebtForHistory, setSelectedDebtForHistory] = useState<CongNoNhaCungCapDto | null>(null);

  // Fetch Suppliers for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await inventoryApi.getSuppliers({ pageSize: 200 });
        if (res.data?.success && res.data.data?.items) {
          setSupplierOptions(
            res.data.data.items.map((s: any) => ({
              label: `${s.ma ? `[${s.ma}] ` : ''}${s.ten}`,
              value: s.id,
            }))
          );
        }
      } catch {
        // Fallback silently if suppliers fail to load
      }
    };
    fetchSuppliers();
  }, []);

  // Fetch debts list
  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billingApi.getSupplierDebts({
        pageIndex,
        pageSize,
        keyword: keyword ? keyword.trim() : undefined,
        supplierId: selectedSupplierId,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        fromDate: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
        toDate: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
      });

      if (res.data?.success && res.data.data) {
        const { danhSach, tongQuan } = res.data.data;
        setDebts(danhSach.items || []);
        setTotalCount(danhSach.totalCount || 0);
        if (tongQuan) {
          setSummary(tongQuan);
        }
      } else {
        setDebts([]);
        setTotalCount(0);
      }
    } catch {
      message.error('Không thể tải danh sách công nợ nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, selectedSupplierId, statusFilter, dateRange, message]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '--';
    try {
      return dayjs(dateStr).format('DD/MM/YYYY');
    } catch {
      return dateStr;
    }
  };

  // Open Payment Modal
  const handleOpenPayment = (debt: CongNoNhaCungCapDto) => {
    setSelectedDebtForPayment(debt);
    paymentForm.resetFields();
    paymentForm.setFieldsValue({
      soTienThanhToan: debt.soTienConLai,
      phuongThucThanhToan: 'CHUYEN_KHOAN',
      ghiChu: '',
    });
    setPaymentModalVisible(true);
  };

  // Submit Payment
  const handlePaymentSubmit = async () => {
    try {
      const values = await paymentForm.validateFields();
      if (!selectedDebtForPayment) return;

      setPaymentSubmitting(true);
      const req: ThanhToanCongNoNhaCungCapRequest = {
        maPhieuNhap: selectedDebtForPayment.id,
        soTienThanhToan: values.soTienThanhToan,
        phuongThucThanhToan: values.phuongThucThanhToan,
        ghiChu: values.ghiChu,
      };

      const res = await billingApi.recordSupplierPayment(req);
      if (res.data?.success) {
        message.success(
          `Thanh toán thành công ${formatCurrency(values.soTienThanhToan)} cho phiếu ${selectedDebtForPayment.maPhieuNhap}`
        );
        setPaymentModalVisible(false);
        fetchDebts();
      } else {
        message.error(res.data?.message || 'Thanh toán thất bại');
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else if (!err?.errorFields) {
        message.error('Có lỗi xảy ra khi thực hiện thanh toán');
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const renderCellContent = (colKey: string, record: CongNoNhaCungCapDto, index: number) => {
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

      case 'maPhieuNhap':
        return (
          <Space size={4}>
            <FileTextOutlined style={{ color: '#0b4f6c' }} />
            <Text strong style={{ color: '#0b4f6c', fontFamily: 'monospace' }}>
              {record.maPhieuNhap}
            </Text>
          </Space>
        );

      case 'nhaCungCap':
        return (
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {record.tenNhaCungCap || 'Chưa xác định'}
            </div>
            <Space size={6} style={{ marginTop: 2 }}>
              {record.maNcc && <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>{record.maNcc}</Tag>}
              {record.soDienThoai && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {record.soDienThoai}
                </Text>
              )}
            </Space>
          </div>
        );

      case 'dates': {
        const isOverdue = record.trangThai === 'QUA_HAN';
        return (
          <div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Nhập: </span>
              <span className="font-mono" style={{ fontSize: 12 }}>{formatDate(record.ngayNhap)}</span>
            </div>
            <div style={{ marginTop: 1 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Hạn: </span>
              <span
                className="font-mono"
                style={{
                  color: isOverdue ? '#cf1322' : '#334155',
                  fontWeight: isOverdue ? 600 : 400,
                  fontSize: 12,
                }}
              >
                {formatDate(record.hanThanhToan)}
              </span>
            </div>
          </div>
        );
      }

      case 'tongTien':
        return (
          <span className="font-mono tabular-nums text-slate-700" style={{ fontWeight: 500 }}>
            {formatCurrency(record.tongTien)}
          </span>
        );

      case 'soTienDaTra':
        return (
          <span className="font-mono tabular-nums" style={{ color: '#16a34a', fontWeight: 600 }}>
            {formatCurrency(record.soTienDaTra)}
          </span>
        );

      case 'soTienConLai':
        return (
          <span
            className="font-mono tabular-nums"
            style={{
              color: record.soTienConLai > 0 ? (record.trangThai === 'QUA_HAN' ? '#cf1322' : '#d97706') : '#16a34a',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {formatCurrency(record.soTienConLai)}
          </span>
        );

      case 'trangThai':
        switch (record.trangThai) {
          case 'DA_TAT_TOAN':
            return (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
                Đã tất toán
              </Tag>
            );
          case 'QUA_HAN':
            return (
              <Tag color="error" icon={<ExclamationCircleOutlined />} style={{ margin: 0 }}>
                Quá hạn {record.soNgayQuaHan > 0 ? `(${record.soNgayQuaHan} ngày)` : ''}
              </Tag>
            );
          case 'DANG_NO':
          default:
            return (
              <Tag color="warning" icon={<DollarOutlined />} style={{ margin: 0 }}>
                Còn nợ
              </Tag>
            );
        }

      case 'actions':
        return (
          <Space size="small">
            {record.soTienConLai > 0 ? (
              <Button
                type="primary"
                size="small"
                icon={<DollarOutlined />}
                onClick={() => handleOpenPayment(record)}
                style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
              >
                Thanh toán
              </Button>
            ) : (
              <Button size="small" disabled>
                Đã trả hết
              </Button>
            )}

            <Tooltip title="Lịch sử thanh toán">
              <Button
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => {
                  setSelectedDebtForHistory(record);
                  setHistoryModalVisible(true);
                }}
              />
            </Tooltip>
          </Space>
        );

      default:
        return null;
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #ef4444',
            }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>TỔNG CÔNG NỢ PHẢI TRẢ</Text>}
              value={summary.tongCongNo}
              formatter={(val) => (
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Còn lại trên <Text strong>{summary.soPhieuChuaThanhToan}</Text> phiếu nhập
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #b91c1c',
            }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>CÔNG NỢ QUÁ HẠN</Text>}
              value={summary.tongNoQuaHan}
              formatter={(val) => (
                <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>
              <ExclamationCircleOutlined style={{ marginRight: 4 }} />
              <Text strong style={{ color: '#dc2626' }}>{summary.soPhieuQuaHan}</Text> phiếu đã quá hạn thanh toán
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #16a34a',
            }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>ĐÃ THANH TOÁN</Text>}
              value={summary.tongDaThanhToan}
              formatter={(val) => (
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Tổng chi trả lũy kế
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #0284c7',
            }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>NHÀ CUNG CẤP CÒN NỢ</Text>}
              value={summary.soNhaCungCapConNo}
              formatter={(val) => (
                <span style={{ color: '#0284c7', fontWeight: 700, fontSize: 20 }}>
                  {val} <span style={{ fontSize: 14, fontWeight: 500 }}>đối tác</span>
                </span>
              )}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Tổng số <Text strong>{summary.tongSoPhieu}</Text> phiếu nhập kho
            </div>
          </Card>
        </Col>
      </Row>

      {/* Control & Filter Toolbar */}
      <div
        style={{
          background: '#fff',
          padding: '14px 18px',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={7}>
            <Input
              placeholder="Tìm theo mã phiếu, tên NCC, SĐT..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={() => {
                setPageIndex(1);
                fetchDebts();
              }}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Chọn nhà cung cấp"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              value={selectedSupplierId}
              onChange={(val) => {
                setSelectedSupplierId(val);
                setPageIndex(1);
              }}
              style={{ width: '100%' }}
              options={supplierOptions}
            />
          </Col>

          <Col xs={12} sm={8} md={4}>
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPageIndex(1);
              }}
              style={{ width: '100%' }}
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Đang nợ', value: 'DANG_NO' },
                { label: 'Quá hạn', value: 'QUA_HAN' },
                { label: 'Đã tất toán', value: 'DA_TAT_TOAN' },
              ]}
            />
          </Col>

          <Col xs={24} sm={10} md={5}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                setPageIndex(1);
              }}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} sm={12} md={4} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setPageIndex(1);
                  fetchDebts();
                }}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Excel Data Grid Table */}
      <div className="excel-grid-container" style={{ flex: 1, minHeight: 320 }}>
        <table className="excel-table w-full min-w-full">
          <colgroup>
            {colOrder.map((colKey) => (
              <col
                key={colKey}
                style={{
                  width: colWidths[colKey] || 100,
                  minWidth: colKey === 'actions' ? colWidths.actions : undefined,
                }}
              />
            ))}
          </colgroup>

          {/* Sticky Header */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 15 }}>
            <tr className="h-9">
              {colOrder.map((colKey) => {
                const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                if (!colDef) return null;
                const isDragging = draggedCol === colKey;
                const isDragOver = dragOverCol === colKey;
                const isFixed = colDef.isFixed;

                return (
                  <th
                    key={colKey}
                    className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef.align}`}
                    style={{
                      width: colWidths[colKey] || 100,
                      cursor: !isFixed ? 'grab' : 'default',
                      userSelect: 'none',
                      backgroundColor: isDragging ? '#e2e8f0' : undefined,
                      borderLeft: isDragOver ? '2px solid #0b4f6c' : undefined,
                    }}
                    draggable={!isFixed}
                    onDragStart={(e) => handleColDragStart(e, colKey)}
                    onDragOver={(e) => handleColDragOver(e, colKey)}
                    onDrop={(e) => handleColDrop(e, colKey)}
                    title={!isFixed ? 'Bấm giữ và kéo thả để đổi thứ tự cột' : undefined}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        width: '100%',
                        justifyContent:
                          colDef.align === 'center'
                            ? 'center'
                            : colDef.align === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                      }}
                    >
                      {!isFixed && (
                        <HolderOutlined style={{ fontSize: 10, color: '#94a3b8', cursor: 'grab' }} />
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {colDef.label}
                      </span>
                    </div>
                    <div className="col-resizer" onMouseDown={(e) => startColResize(colKey, e)} />
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang tải danh sách công nợ nhà cung cấp...</span>
                  </div>
                </td>
              </tr>
            ) : orderedDebts.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff', color: '#94a3b8' }}>
                  <ShopOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block', color: '#cbd5e1' }} />
                  Không có khoản công nợ nhà cung cấp nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              orderedDebts.map((record, index) => {
                const isDraggingRow = draggedRowId === record.id;
                return (
                  <tr
                    key={record.id}
                    className="h-9"
                    style={{
                      opacity: isDraggingRow ? 0.4 : 1,
                      backgroundColor: isDraggingRow ? '#f0fdf4' : undefined,
                    }}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, record.id)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, record.id)}
                  >
                    {colOrder.map((colKey) => {
                      const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                      return (
                        <td
                          key={colKey}
                          className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef?.align || 'left'}`}
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {renderCellContent(colKey, record, index)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination Bar */}
      <div
        className="excel-grid-footer"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
          padding: '6px 4px',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Tổng cộng: <strong>{totalCount}</strong> phiếu nhập • Trang{' '}
          <strong>{pageIndex}</strong> / {Math.max(1, Math.ceil(totalCount / pageSize))}
        </div>
        <Pagination
          size="small"
          current={pageIndex}
          pageSize={pageSize}
          total={totalCount}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          onChange={(page, size) => {
            setPageIndex(page);
            setPageSize(size);
          }}
        />
      </div>

      {/* Payment Modal */}
      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: '#0b4f6c' }} />
            <span>Thanh toán công nợ nhà cung cấp</span>
          </Space>
        }
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onOk={handlePaymentSubmit}
        confirmLoading={paymentSubmitting}
        okText="Xác nhận thanh toán"
        cancelText="Đóng"
        destroyOnClose
      >
        {selectedDebtForPayment && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                marginBottom: 16,
              }}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Text type="secondary">Mã phiếu nhập:</Text>{' '}
                  <Text strong>{selectedDebtForPayment.maPhieuNhap}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Ngày nhập:</Text>{' '}
                  <Text>{formatDate(selectedDebtForPayment.ngayNhap)}</Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Nhà cung cấp:</Text>{' '}
                  <Text strong>{selectedDebtForPayment.tenNhaCungCap}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Tổng tiền hàng:</Text>{' '}
                  <Text>{formatCurrency(selectedDebtForPayment.tongTien)}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Đã trả trước đó:</Text>{' '}
                  <Text style={{ color: '#16a34a' }}>
                    {formatCurrency(selectedDebtForPayment.soTienDaTra)}
                  </Text>
                </Col>
                <Col span={24} style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 6, marginTop: 4 }}>
                  <Text type="secondary">Còn nợ hiện tại: </Text>
                  <Text strong style={{ color: '#cf1322', fontSize: 16 }}>
                    {formatCurrency(selectedDebtForPayment.soTienConLai)}
                  </Text>
                </Col>
              </Row>
            </div>

            <Form form={paymentForm} layout="vertical">
              <Form.Item
                name="soTienThanhToan"
                label="Số tiền thanh toán (₫)"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền thanh toán' },
                  {
                    type: 'number',
                    min: 1000,
                    message: 'Số tiền thanh toán tối thiểu là 1.000 ₫',
                  },
                  {
                    validator: (_, value) => {
                      if (value && value > selectedDebtForPayment.soTienConLai) {
                        return Promise.reject(
                          new Error(`Số tiền không được vượt quá số nợ còn lại (${formatCurrency(selectedDebtForPayment.soTienConLai)})`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0)}
                  min={1000}
                  max={selectedDebtForPayment.soTienConLai}
                />
              </Form.Item>

              <div style={{ marginBottom: 14 }}>
                <Space size="small">
                  <Button
                    size="small"
                    onClick={() =>
                      paymentForm.setFieldsValue({
                        soTienThanhToan: selectedDebtForPayment.soTienConLai,
                      })
                    }
                  >
                    Thanh toán toàn bộ (100%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      paymentForm.setFieldsValue({
                        soTienThanhToan: Math.round(selectedDebtForPayment.soTienConLai / 2),
                      })
                    }
                  >
                    Thanh toán 50%
                  </Button>
                </Space>
              </div>

              <Form.Item
                name="phuongThucThanhToan"
                label="Phương thức thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
              >
                <Select
                  options={[
                    { label: 'Chuyển khoản ngân hàng', value: 'CHUYEN_KHOAN' },
                    { label: 'Tiền mặt', value: 'TIEN_MAT' },
                    { label: 'Thẻ tín dụng / Ghi nợ', value: 'THE' },
                    { label: 'Khác', value: 'KHAC' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="ghiChu" label="Ghi chú thanh toán / Mã ủy nhiệm chi">
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập thông tin chứng từ hoặc ghi chú giao dịch..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: '#0b4f6c' }} />
            <span>Lịch sử thanh toán - Phiếu {selectedDebtForHistory?.maPhieuNhap}</span>
          </Space>
        }
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={650}
      >
        {selectedDebtForHistory && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Text strong>{selectedDebtForHistory.tenNhaCungCap}</Text>
              <div>
                <Text type="secondary">Tổng tiền hàng: </Text>
                <Text strong>{formatCurrency(selectedDebtForHistory.tongTien)}</Text> |{' '}
                <Text type="secondary">Đã trả: </Text>
                <Text style={{ color: '#16a34a' }}>
                  {formatCurrency(selectedDebtForHistory.soTienDaTra)}
                </Text> |{' '}
                <Text type="secondary">Còn nợ: </Text>
                <Text style={{ color: '#cf1322', fontWeight: 600 }}>
                  {formatCurrency(selectedDebtForHistory.soTienConLai)}
                </Text>
              </div>
            </div>

            <Table<LichSuThanhToanNhaCungCapDto>
              size="small"
              rowKey="lan"
              dataSource={selectedDebtForHistory.lichSuThanhToan || []}
              pagination={false}
              locale={{
                emptyText: 'Chưa có lượt thanh toán nào được ghi nhận cho phiếu này',
              }}
              columns={[
                {
                  title: 'Lần',
                  dataIndex: 'lan',
                  key: 'lan',
                  width: 60,
                  align: 'center',
                },
                {
                  title: 'Ngày thanh toán',
                  dataIndex: 'ngayThanhToan',
                  key: 'ngayThanhToan',
                  width: 160,
                },
                {
                  title: 'Số tiền',
                  dataIndex: 'soTien',
                  key: 'soTien',
                  align: 'right',
                  width: 140,
                  render: (val) => (
                    <Text strong style={{ color: '#16a34a' }}>
                      {formatCurrency(val)}
                    </Text>
                  ),
                },
                {
                  title: 'Phương thức',
                  dataIndex: 'phuongThuc',
                  key: 'phuongThuc',
                  width: 130,
                  render: (m) => {
                    switch (m) {
                      case 'CHUYEN_KHOAN':
                        return <Tag color="blue">Chuyển khoản</Tag>;
                      case 'TIEN_MAT':
                        return <Tag color="green">Tiền mặt</Tag>;
                      case 'THE':
                        return <Tag color="purple">Thẻ</Tag>;
                      default:
                        return <Tag>{m}</Tag>;
                    }
                  },
                },
                {
                  title: 'Ghi chú',
                  dataIndex: 'ghiChu',
                  key: 'ghiChu',
                  render: (note) => note || '--',
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupplierDebtsTable;
