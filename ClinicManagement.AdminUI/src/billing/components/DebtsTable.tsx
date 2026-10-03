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
  InputNumber,
  Radio,
  App,
  Pagination,
} from 'antd';
import {
  ReloadOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  HolderOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  CongNoBenhNhanChiTietDto,
  TongQuanCongNoBenhNhanDto,
  CongNoDto,
} from '../types/billing.types';
import { billingApi } from '../api/billing.api';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const ALL_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'benhNhan', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'hoaDon', label: 'HÓA ĐƠN', align: 'left' },
  { key: 'hanThanhToan', label: 'HẠN THANH TOÁN', align: 'left' },
  { key: 'soTienNo', label: 'NỢ BAN ĐẦU', align: 'right' },
  { key: 'soTienDaTra', label: 'ĐÃ THANH TOÁN', align: 'right' },
  { key: 'soTienConLai', label: 'CÒN LẠI', align: 'right' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
];

const DEFAULT_COL_ORDER = [
  'stt',
  'benhNhan',
  'hoaDon',
  'hanThanhToan',
  'soTienNo',
  'soTienDaTra',
  'soTienConLai',
  'trangThai',
];

export const DebtsTable: React.FC = () => {
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [debts, setDebts] = useState<CongNoBenhNhanChiTietDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // View modes: 'all' (paged list with filters) vs 'patient' (direct single patient lookup)
  const [viewMode, setViewMode] = useState<'all' | 'patient'>('all');
  const [patientIdInput, setPatientIdInput] = useState<number | null>(null);
  const [searchedPatientId, setSearchedPatientId] = useState<number | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Resizer
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 55,
    benhNhan: 250,
    hoaDon: 140,
    hanThanhToan: 170,
    soTienNo: 150,
    soTienDaTra: 140,
    soTienConLai: 150,
    trangThai: 130,
  });

  // Column Reordering
  const [colOrder, setColOrder] = useState<string[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: string) => {
    if (colKey === 'stt') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    if (colKey === 'stt' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt') {
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
  const [orderedDebts, setOrderedDebts] = useState<CongNoBenhNhanChiTietDto[]>([]);
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
  const [summary, setSummary] = useState<TongQuanCongNoBenhNhanDto>({
    tongCongNo: 0,
    tongNoQuaHan: 0,
    tongDaThanhToan: 0,
    soKhoanNo: 0,
    soKhoanQuaHan: 0,
    soBenhNhanConNo: 0,
    tongSoKhoan: 0,
  });

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'patient') {
        if (!searchedPatientId) {
          setDebts([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        const res = await billingApi.getPatientDebts(searchedPatientId);
        if (res.data.success && res.data.data) {
          const list: CongNoDto[] = res.data.data;
          const mapped: CongNoBenhNhanChiTietDto[] = list.map((d) => ({
            id: d.id,
            maBenhNhan: d.maBenhNhan,
            tenBenhNhan: `Bệnh nhân #${d.maBenhNhan}`,
            soDienThoai: '--',
            soCCCD: '--',
            maHoaDon: d.maHoaDon,
            soHoaDon: `#${d.maHoaDon}`,
            ngayLapHoaDon: d.hanThanhToan || new Date().toISOString(),
            maCoSo: 0,
            tongTienHoaDon: d.soTienNo,
            soTienNo: d.soTienNo,
            soTienDaTra: d.soTienDaTra,
            soTienConLai: d.soTienConLai,
            hanThanhToan: d.hanThanhToan,
            trangThai: d.trangThai,
            trangThaiTen:
              d.trangThai === 'DA_TAT_TOAN'
                ? 'Đã tất toán'
                : d.trangThai === 'QUA_HAN'
                ? 'Quá hạn'
                : 'Đang nợ',
            soNgayQuaHan: 0,
          }));
          setDebts(mapped);
          setTotalCount(mapped.length);
        } else {
          setDebts([]);
          setTotalCount(0);
        }
      } else {
        const res = await billingApi.getPatientDebtsPaged({
          pageIndex,
          pageSize,
          keyword: keyword ? keyword.trim() : undefined,
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
      }
    } catch {
      message.error('Không thể tải danh sách công nợ bệnh nhân');
    } finally {
      setLoading(false);
    }
  }, [viewMode, searchedPatientId, pageIndex, pageSize, keyword, statusFilter, dateRange, message]);

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

  const renderCellContent = (colKey: string, record: CongNoBenhNhanChiTietDto, index: number) => {
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

      case 'benhNhan':
        return (
          <div>
            <Space size={4}>
              <UserOutlined style={{ color: '#0b4f6c' }} />
              <Text strong style={{ color: '#1e293b' }}>
                {record.tenBenhNhan || `BN #${record.maBenhNhan}`}
              </Text>
            </Space>
            <div style={{ marginTop: 2, fontSize: 11.5, color: '#64748b' }}>
              <span>Mã: <strong>{record.maBenhNhan}</strong></span>
              {record.soDienThoai && record.soDienThoai !== '--' && (
                <span style={{ marginLeft: 6 }}>• SĐT: {record.soDienThoai}</span>
              )}
            </div>
          </div>
        );

      case 'hoaDon':
        return (
          <Space size={4}>
            <FileTextOutlined style={{ color: '#0284c7' }} />
            <Text strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>
              {record.soHoaDon || `#${record.maHoaDon}`}
            </Text>
          </Space>
        );

      case 'hanThanhToan': {
        const isOverdue = record.trangThai === 'QUA_HAN';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="font-mono"
              style={{ color: isOverdue ? '#cf1322' : '#334155', fontWeight: isOverdue ? 600 : 400 }}
            >
              {formatDate(record.hanThanhToan)}
            </span>
            {isOverdue && <Tag color="error" style={{ margin: 0, fontSize: 10 }}>Quá hạn</Tag>}
          </div>
        );
      }

      case 'soTienNo':
        return (
          <span className="font-mono tabular-nums text-slate-700" style={{ fontWeight: 500 }}>
            {formatCurrency(record.soTienNo)}
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
          case 'DANG_NO':
            return (
              <Tag color="warning" icon={<DollarOutlined />} style={{ margin: 0 }}>
                Đang nợ
              </Tag>
            );
          case 'DA_TAT_TOAN':
            return (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
                Đã tất toán
              </Tag>
            );
          case 'QUA_HAN':
            return (
              <Tag color="error" icon={<ExclamationCircleOutlined />} style={{ margin: 0 }}>
                Quá hạn
              </Tag>
            );
          default:
            return <Tag style={{ margin: 0 }}>{record.trangThai}</Tag>;
        }

      default:
        return null;
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Summary Cards */}
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
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>TỔNG CÔNG NỢ BỆNH NHÂN</Text>}
              value={summary.tongCongNo}
              formatter={(val) => (
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Còn lại trên <Text strong>{summary.soKhoanNo}</Text> khoản nợ
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
              <Text strong style={{ color: '#dc2626' }}>{summary.soKhoanQuaHan}</Text> khoản đã quá hạn
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
              Tổng tiền bệnh nhân đã trả
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
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>BỆNH NHÂN CÒN NỢ</Text>}
              value={summary.soBenhNhanConNo}
              formatter={(val) => (
                <span style={{ color: '#0284c7', fontWeight: 700, fontSize: 20 }}>
                  {val} <span style={{ fontSize: 14, fontWeight: 500 }}>bệnh nhân</span>
                </span>
              )}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Tổng số <Text strong>{summary.tongSoKhoan}</Text> khoản nợ ghi nhận
            </div>
          </Card>
        </Col>
      </Row>

      {/* Control & Toolbar */}
      <div
        style={{
          background: '#fff',
          padding: '14px 18px',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Row gutter={[12, 12]} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <Space wrap size="middle">
              <Radio.Group
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value);
                  setPageIndex(1);
                  if (e.target.value === 'patient') {
                    setSearchedPatientId(null);
                    setDebts([]);
                  }
                }}
                buttonStyle="solid"
              >
                <Radio.Button value="all">Tất cả công nợ</Radio.Button>
                <Radio.Button value="patient">Theo bệnh nhân</Radio.Button>
              </Radio.Group>

              {viewMode === 'patient' ? (
                <Space>
                  <InputNumber
                    placeholder="Nhập mã bệnh nhân..."
                    value={patientIdInput}
                    onChange={(val) => setPatientIdInput(val)}
                    onPressEnter={() => setSearchedPatientId(patientIdInput)}
                    style={{ width: 190 }}
                    min={1}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    disabled={!patientIdInput}
                    onClick={() => setSearchedPatientId(patientIdInput)}
                  >
                    Tra cứu
                  </Button>
                </Space>
              ) : (
                <Space wrap>
                  <Input
                    placeholder="Tìm tên BN, SĐT, CCCD, số HĐ..."
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={() => {
                      setPageIndex(1);
                      fetchDebts();
                    }}
                    style={{ width: 250 }}
                    allowClear
                  />

                  <Select
                    value={statusFilter}
                    onChange={(val) => {
                      setStatusFilter(val);
                      setPageIndex(1);
                    }}
                    style={{ width: 150 }}
                    options={[
                      { label: 'Tất cả trạng thái', value: 'ALL' },
                      { label: 'Đang nợ', value: 'DANG_NO' },
                      { label: 'Quá hạn', value: 'QUA_HAN' },
                      { label: 'Đã tất toán', value: 'DA_TAT_TOAN' },
                    ]}
                  />

                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => {
                      setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                      setPageIndex(1);
                    }}
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                    style={{ width: 230 }}
                  />
                </Space>
              )}
            </Space>
          </Col>

          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
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
              <col key={colKey} style={{ width: colWidths[colKey] || 100 }} />
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
                    <span>Đang tải danh sách công nợ bệnh nhân...</span>
                  </div>
                </td>
              </tr>
            ) : orderedDebts.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff', color: '#94a3b8' }}>
                  <UserOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block', color: '#cbd5e1' }} />
                  {viewMode === 'patient' && !searchedPatientId
                    ? 'Nhập mã bệnh nhân (ID nội bộ, ví dụ 6007) rồi bấm Tra cứu'
                    : 'Không có khoản nợ nào phù hợp với bộ lọc'}
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
          Tổng cộng: <strong>{totalCount}</strong> khoản nợ • Trang{' '}
          <strong>{pageIndex}</strong> / {Math.max(1, Math.ceil(totalCount / pageSize))}
        </div>
        {viewMode === 'all' && (
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
        )}
      </div>
    </div>
  );
};

export default DebtsTable;
