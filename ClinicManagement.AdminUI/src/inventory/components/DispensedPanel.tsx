import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Space,
  DatePicker,
  App,
} from 'antd';
import {
  ReloadOutlined,
  PrinterOutlined,
  SearchOutlined,
  CloseOutlined,
  FileTextOutlined,
  HolderOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  DispensedPrescriptionDto,
  PrescriptionPrintDto,
} from '../types/inventory.types';
import { inventoryApi } from '../api/inventory.api';
import PrescriptionPrintModal from './PrescriptionPrintModal';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

const { RangePicker } = DatePicker;

type DispensedColKey =
  | 'stt'
  | 'prescriptionCode'
  | 'maLuotKham'
  | 'patientName'
  | 'doctorName'
  | 'dispenserName'
  | 'ngayKe'
  | 'ngayCapThuoc'
  | 'soLuongDong'
  | 'exportReceiptCode'
  | 'trangThai'
  | 'thaoTac';

interface DispensedColumnDef {
  key: DispensedColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: DispensedColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'prescriptionCode', label: 'MÃ ĐƠN', align: 'left' },
  { key: 'maLuotKham', label: 'LƯỢT KHÁM', align: 'left' },
  { key: 'patientName', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'doctorName', label: 'BÁC SĨ KÊ', align: 'left' },
  { key: 'dispenserName', label: 'DƯỢC SĨ CẤP', align: 'left' },
  { key: 'ngayKe', label: 'NGÀY KÊ', align: 'center' },
  { key: 'ngayCapThuoc', label: 'THỜI GIAN CẤP PHÁT', align: 'center' },
  { key: 'soLuongDong', label: 'SỐ MÓN', align: 'center' },
  { key: 'exportReceiptCode', label: 'PHIẾU XUẤT KHO', align: 'left' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: DispensedColKey[] = [
  'stt',
  'prescriptionCode',
  'maLuotKham',
  'patientName',
  'doctorName',
  'dispenserName',
  'ngayKe',
  'ngayCapThuoc',
  'soLuongDong',
  'exportReceiptCode',
  'trangThai',
  'thaoTac',
];

const DispensedPanel: React.FC = () => {
  const { message } = App.useApp();

  // ── State dữ liệu ──────────────────────────────────────────────────────────
  const [dispensedList, setDispensedList] = useState<DispensedPrescriptionDto[]>([]);
  const [loading, setLoading] = useState(false);

  // ── State bộ lọc ──────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // ── State phân trang ───────────────────────────────────────────────────────
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState(0);

  // ── Modal in đơn thuốc ─────────────────────────────────────────────────────
  const [printData, setPrintData] = useState<PrescriptionPrintDto | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    prescriptionCode: 135,
    maLuotKham: 105,
    patientName: 200,
    doctorName: 150,
    dispenserName: 140,
    ngayKe: 110,
    ngayCapThuoc: 145,
    soLuongDong: 90,
    exportReceiptCode: 160,
    trangThai: 120,
    thaoTac: 90,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<DispensedColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<DispensedColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<DispensedColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: DispensedColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: DispensedColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: DispensedColKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt' || targetCol === 'thaoTac') {
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

  // ── Fetch dữ liệu đơn thuốc đã cấp phát ───────────────────────────────────
  const fetchDispensed = useCallback(async () => {
    setLoading(true);
    try {
      const fromDate = dateRange?.[0] ? dateRange[0].startOf('day').toISOString() : undefined;
      const toDate = dateRange?.[1] ? dateRange[1].endOf('day').toISOString() : undefined;

      const res = await inventoryApi.getDispensedPrescriptions({
        keyword: keyword.trim() || undefined,
        fromDate,
        toDate,
        pageIndex,
        pageSize,
      });

      if (res.data.success && res.data.data) {
        setDispensedList(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      } else {
        setDispensedList([]);
        setTotal(0);
      }
    } catch {
      message.error('Lỗi khi tải danh sách đơn thuốc đã cấp phát');
      setDispensedList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, dateRange, pageIndex, pageSize, message]);

  useEffect(() => {
    fetchDispensed();
  }, [fetchDispensed]);

  const displayedItems = useMemo(() => {
    return dispensedList;
  }, [dispensedList]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<DispensedPrescriptionDto[]>([]);
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  useEffect(() => {
    setOrderedItems(displayedItems);
  }, [displayedItems]);

  const handleRowDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRowIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === index) return;
    setDragOverRowIndex(index);
  };

  const handleRowDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === index) {
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
      return;
    }
    const updated = [...orderedItems];
    const [removed] = updated.splice(draggedRowIndex, 1);
    updated.splice(index, 0, removed);
    setOrderedItems(updated);
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setKeyword(searchKeyword);
    setPageIndex(1);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setKeyword('');
    setDateRange(null);
    setPageIndex(1);
  };

  const handleOpenPrint = async (prescriptionId: number) => {
    setPrintLoading(true);
    setPrintModalOpen(true);
    try {
      const res = await inventoryApi.getPrescriptionPrintData(prescriptionId);
      if (res.data.success && res.data.data) {
        setPrintData(res.data.data);
      } else {
        message.error(res.data.message || 'Không thể tải dữ liệu in đơn thuốc');
        setPrintModalOpen(false);
      }
    } catch {
      message.error('Lỗi khi tải thông tin in đơn thuốc');
      setPrintModalOpen(false);
    } finally {
      setPrintLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={styles.panelContainer}>
      {/* ── TOOLBAR BỘ LỌC ──────────────────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <form onSubmit={handleSearchSubmit} style={styles.toolbarLeft}>
          <div style={styles.searchBox}>
            <SearchOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, bệnh nhân, BS, phiếu..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={styles.searchInput}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setKeyword('');
                  setPageIndex(1);
                }}
                style={styles.clearSearchBtn}
              >
                <CloseOutlined style={{ fontSize: 10 }} />
              </button>
            )}
          </div>

          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates as any);
              setPageIndex(1);
            }}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ height: 32, borderRadius: 5, border: '1px solid #cbd5e1' }}
          />

          <button type="submit" style={styles.filterBtn}>
            Lọc
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={styles.resetBtn}
            title="Đặt lại bộ lọc"
          >
            Đặt lại
          </button>
        </form>

        <div style={styles.toolbarRight}>
          <span style={styles.summaryBadge}>
            Đã cấp phát: <strong>{total}</strong> đơn
          </span>
        </div>
      </div>

      {/* ── EXCEL DATA GRID CONTAINER (FULL WIDTH, RESIZE, REORDER) ─────────── */}
      <div
        className="w-full flex-1 min-h-0 bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto overflow-y-auto excel-grid-container"
        style={styles.gridContainer}
      >
        <table className="excel-table w-full min-w-full">
          <colgroup>
            {colOrder.map((colKey) => (
              <col
                key={colKey}
                style={{
                  width: colWidths[colKey] || 100,
                  minWidth: colKey === 'thaoTac' ? colWidths.thaoTac : undefined,
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
                      borderLeft: isDragOver ? '2px solid #2563eb' : undefined,
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

          {/* Dữ liệu các dòng */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.loadingCell}>
                  <div style={styles.loadingWrapper}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang trích xuất lịch sử cấp phát...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#94a3b8' }} />
                    <strong style={{ color: '#475569' }}>Không tìm thấy đơn thuốc đã cấp phát nào</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Thử thay đổi khoảng ngày tìm kiếm hoặc từ khóa tra cứu
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const sttNumber = (pageIndex - 1) * pageSize + index + 1;
                const isDraggingRow = draggedRowIndex === index;
                const isDragOverRow = dragOverRowIndex === index;
                const code = item.prescriptionCode || `#${item.prescriptionId}`;

                return (
                  <tr
                    key={item.prescriptionId || index}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, index)}
                    onDragOver={(e) => handleRowDragOver(e, index)}
                    onDrop={(e) => handleRowDrop(e, index)}
                    className="hover:bg-blue-50/60 even:bg-slate-50/30"
                    style={{
                      transition: 'background-color 0.12s ease',
                      opacity: isDraggingRow ? 0.35 : 1,
                      borderTop: isDragOverRow ? '2px dashed #2563eb' : undefined,
                    }}
                  >
                    {colOrder.map((colKey) => {
                      switch (colKey) {
                        case 'stt':
                          return (
                            <td
                              key={colKey}
                              className="col-stt text-center font-mono"
                              style={{ cursor: 'grab' }}
                              title="Bấm giữ để kéo thả đổi vị trí dòng"
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                <HolderOutlined style={{ fontSize: 10, color: '#94a3b8' }} />
                                <span>{sttNumber}</span>
                              </div>
                            </td>
                          );

                        case 'prescriptionCode':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  fontSize: 11.5,
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleOpenPrint(item.prescriptionId)}
                                title={`Bấm để in lại đơn ${code}`}
                              >
                                {code}
                              </span>
                            </td>
                          );

                        case 'maLuotKham':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <span style={{ color: '#475569', fontSize: 11.5 }}>
                                #{item.maLuotKham}
                              </span>
                            </td>
                          );

                        case 'patientName':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  fontSize: 12,
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={item.patientName || '—'}
                              >
                                {item.patientName || '—'}
                              </span>
                            </td>
                          );

                        case 'doctorName':
                          return (
                            <td
                              key={colKey}
                              className="text-left"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={item.doctorName || '—'}
                            >
                              {item.doctorName || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'dispenserName':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '1px 6px',
                                  borderRadius: 3,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  backgroundColor: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                }}
                                title={item.dispenserName || 'Dược sĩ quầy'}
                              >
                                {item.dispenserName || 'Dược sĩ quầy'}
                              </span>
                            </td>
                          );

                        case 'ngayKe':
                          return (
                            <td
                              key={colKey}
                              className="text-center font-mono"
                              style={{ ...styles.cellEllipsis, color: '#475569', fontSize: 11.5 }}
                              title={formatDate(item.ngayKe)}
                            >
                              {formatDate(item.ngayKe)}
                            </td>
                          );

                        case 'ngayCapThuoc':
                          return (
                            <td
                              key={colKey}
                              className="text-center font-mono"
                              style={{ ...styles.cellEllipsis, color: '#1e293b', fontWeight: 600, fontSize: 11.5 }}
                              title={formatDateTime(item.ngayCapThuoc)}
                            >
                              {formatDateTime(item.ngayCapThuoc)}
                            </td>
                          );

                        case 'soLuongDong':
                          return (
                            <td key={colKey} className="text-center font-mono" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '1px 6px',
                                  borderRadius: 3,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                }}
                              >
                                {item.soLuongDong} thuốc
                              </span>
                            </td>
                          );

                        case 'exportReceiptCode':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              {item.exportReceiptCode ? (
                                <Space size={4}>
                                  <FileTextOutlined style={{ color: '#0284c7', fontSize: 11 }} />
                                  <span style={{ color: '#0284c7', fontWeight: 600, fontSize: 11.5 }}>
                                    {item.exportReceiptCode}
                                  </span>
                                </Space>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                          );

                        case 'trangThai':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              <span className="excel-badge success">
                                <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }} />
                                Đã cấp phát
                              </span>
                            </td>
                          );

                        case 'thaoTac':
                          return (
                            <td key={colKey} className="text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenPrint(item.prescriptionId)}
                                style={styles.btnPrint}
                                title="In lại đơn thuốc"
                              >
                                <PrinterOutlined style={{ fontSize: 12, marginRight: 4 }} />
                                <span>In lại</span>
                              </button>
                            </td>
                          );

                        default:
                          return null;
                      }
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER PHÂN TRANG CỐ ĐỊNH DƯỚI CHÂN BẢNG ────────────────────────── */}
      <div style={styles.paginationFooter}>
        <div style={styles.paginationLeft}>
          <span>
            Tổng số bản ghi: <strong>{total}</strong> đơn
          </span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span>
            Đang hiển thị <strong>{orderedItems.length}</strong> dòng
          </span>
        </div>

        <div style={styles.paginationRight}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>Số dòng/trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
              style={styles.pageSizeSelect}
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
          </div>

          <div style={styles.pageButtonGroup}>
            <button
              type="button"
              disabled={pageIndex <= 1 || loading}
              onClick={() => setPageIndex((p) => p - 1)}
              style={styles.pageNavBtn}
            >
              ‹ Trước
            </button>

            <span style={styles.pageIndicator}>
              Trang <strong>{pageIndex}</strong> / {totalPages}
            </span>

            <button
              type="button"
              disabled={pageIndex >= totalPages || loading}
              onClick={() => setPageIndex((p) => p + 1)}
              style={styles.pageNavBtn}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal in đơn thuốc chuẩn Y Tế */}
      <PrescriptionPrintModal
        open={printModalOpen}
        data={printData}
        loading={printLoading}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintData(null);
        }}
      />
    </div>
  );
};

export default DispensedPanel;

// ── STYLES TIÊU CHUẨN ────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  panelContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 12px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    flexShrink: 0,
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '0 8px',
    height: 32,
    minWidth: 230,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: 12,
    width: '100%',
    color: '#1e293b',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 11,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  filterBtn: {
    height: 32,
    padding: '0 12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    height: 32,
    padding: '0 10px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },
  summaryBadge: {
    fontSize: 11.5,
    color: '#475569',
  },
  gridContainer: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  loadingCell: {
    padding: '48px 16px',
    textAlign: 'center',
    color: '#64748b',
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 13,
  },
  emptyCell: {
    padding: '48px 16px',
    textAlign: 'center',
  },
  emptyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cellEllipsis: {
    maxWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    marginRight: 5,
    display: 'inline-block',
  },
  btnPrint: {
    padding: '3px 8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 11.5,
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 12px',
    flexShrink: 0,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  },
  paginationLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11.5,
    color: '#475569',
  },
  paginationRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pageSizeSelect: {
    height: 28,
    padding: '0 6px',
    fontSize: 11.5,
    borderRadius: 4,
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
  },
  pageButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  pageNavBtn: {
    height: 28,
    padding: '0 10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 11.5,
    color: '#334155',
    cursor: 'pointer',
  },
  pageIndicator: {
    fontSize: 11.5,
    color: '#475569',
    padding: '0 4px',
  },
};
