import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DatePicker,
  Drawer,
  Descriptions,
  App,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
  ShopOutlined,
  UserOutlined,
  HolderOutlined,
  CloseOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import {
  ProcedureSupplyExportDto,
  ProcedureSupplyExportItemDto,
} from '../types/inventory.types';
import { inventoryApi } from '../api/inventory.api';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

const { RangePicker } = DatePicker;

type ProcedureExportColKey =
  | 'stt'
  | 'maPhieu'
  | 'ngayXuat'
  | 'loaiXuat'
  | 'tenKhoXuat'
  | 'tenNguoiXuat'
  | 'ghiChu'
  | 'soLuongMatHang'
  | 'tongSoLuongXuat'
  | 'thaoTac';

interface ProcedureExportColumnDef {
  key: ProcedureExportColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: ProcedureExportColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'maPhieu', label: 'MÃ PHIẾU', align: 'left' },
  { key: 'ngayXuat', label: 'THỜI GIAN XUẤT', align: 'center' },
  { key: 'loaiXuat', label: 'LOẠI XUẤT', align: 'center' },
  { key: 'tenKhoXuat', label: 'KHO XUẤT', align: 'left' },
  { key: 'tenNguoiXuat', label: 'NGƯỜI THỰC HIỆN', align: 'left' },
  { key: 'ghiChu', label: 'DIỄN GIẢI / DỊCH VỤ KT', align: 'left' },
  { key: 'soLuongMatHang', label: 'SỐ MÓN', align: 'center' },
  { key: 'tongSoLuongXuat', label: 'TỔNG SỐ LƯỢNG', align: 'right' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: ProcedureExportColKey[] = [
  'stt',
  'maPhieu',
  'ngayXuat',
  'loaiXuat',
  'tenKhoXuat',
  'tenNguoiXuat',
  'ghiChu',
  'soLuongMatHang',
  'tongSoLuongXuat',
  'thaoTac',
];

interface Props {
  onCreateExportClick?: () => void;
}

export const ProcedureSupplyExportPanel: React.FC<Props> = ({ onCreateExportClick }) => {
  const { message } = App.useApp();

  // ── State dữ liệu ──────────────────────────────────────────────────────────
  const [exportsList, setExportsList] = useState<ProcedureSupplyExportDto[]>([]);
  const [loading, setLoading] = useState(false);

  // ── State bộ lọc ──────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loaiXuat, setLoaiXuat] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // ── State phân trang ───────────────────────────────────────────────────────
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState(0);

  // ── Detail Drawer state ───────────────────────────────────────────────────
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedExport, setSelectedExport] = useState<ProcedureSupplyExportDto | null>(null);

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    maPhieu: 180,
    ngayXuat: 145,
    loaiXuat: 175,
    tenKhoXuat: 150,
    tenNguoiXuat: 150,
    ghiChu: 240,
    soLuongMatHang: 90,
    tongSoLuongXuat: 125,
    thaoTac: 100,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<ProcedureExportColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<ProcedureExportColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ProcedureExportColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: ProcedureExportColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: ProcedureExportColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: ProcedureExportColKey) => {
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

  // ── Fetch danh sách từ API ────────────────────────────────────────────────
  const fetchExports = useCallback(async () => {
    setLoading(true);
    try {
      const fromDate = dateRange?.[0] ? dateRange[0].startOf('day').toISOString() : undefined;
      const toDate = dateRange?.[1] ? dateRange[1].endOf('day').toISOString() : undefined;

      const res = await inventoryApi.getProcedureSupplyExports({
        keyword: keyword.trim() || undefined,
        loaiXuat,
        fromDate,
        toDate,
        pageIndex,
        pageSize,
      });

      if (res.data?.success && res.data.data) {
        setExportsList(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      } else {
        setExportsList([]);
        setTotal(0);
      }
    } catch {
      message.error('Lỗi khi tải danh sách phiếu xuất vật tư');
      setExportsList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, loaiXuat, dateRange, pageIndex, pageSize, message]);

  useEffect(() => {
    fetchExports();
  }, [fetchExports]);

  const displayedItems = useMemo(() => {
    return exportsList;
  }, [exportsList]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<ProcedureSupplyExportDto[]>([]);
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
    setLoaiXuat(undefined);
    setDateRange(null);
    setPageIndex(1);
  };

  const handleViewDetail = (record: ProcedureSupplyExportDto) => {
    setSelectedExport(record);
    setDetailDrawerOpen(true);
  };

  const formatDateTime = (dateStr?: string | null) => {
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

  const formatDate = (dateStr?: string | null) => {
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
              placeholder="Tìm theo mã phiếu, vật tư, ghi chú..."
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

          <select
            value={loaiXuat || ''}
            onChange={(e) => {
              const val = e.target.value;
              setLoaiXuat(val === '' ? undefined : val);
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 175 }}
          >
            <option value="">Tất cả loại xuất</option>
            <option value="XUAT_THU_THUAT">Kỹ thuật / Thủ thuật</option>
            <option value="XUAT_NOI_BO">Xuất nội bộ tiêu hao</option>
          </select>

          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates as [Dayjs | null, Dayjs | null]);
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
            Tổng: <strong>{total}</strong> phiếu xuất
          </span>

          {onCreateExportClick && (
            <button
              type="button"
              onClick={onCreateExportClick}
              style={styles.btnPrimary}
              title="Tạo phiếu xuất vật tư mới"
            >
              <PlusOutlined style={{ fontSize: 12 }} />
              <span>Xuất vật tư</span>
            </button>
          )}
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
                    <span>Đang trích xuất phiếu xuất vật tư kỹ thuật...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <ExperimentOutlined style={{ fontSize: 24, color: '#94a3b8' }} />
                    <strong style={{ color: '#475569' }}>Không tìm thấy phiếu xuất vật tư nào</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Thử thay đổi từ khóa tra cứu hoặc chọn loại xuất khác
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const sttNumber = (pageIndex - 1) * pageSize + index + 1;
                const isDraggingRow = draggedRowIndex === index;
                const isDragOverRow = dragOverRowIndex === index;

                return (
                  <tr
                    key={item.id || index}
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

                        case 'maPhieu':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  fontSize: 11.5,
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleViewDetail(item)}
                                title={`Bấm xem chi tiết phiếu ${item.maPhieu}`}
                              >
                                {item.maPhieu}
                              </span>
                            </td>
                          );

                        case 'ngayXuat':
                          return (
                            <td
                              key={colKey}
                              className="text-center font-mono"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={formatDateTime(item.ngayXuat)}
                            >
                              {formatDateTime(item.ngayXuat)}
                            </td>
                          );

                        case 'loaiXuat':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              {item.loaiXuat === 'XUAT_THU_THUAT' ? (
                                <span className="excel-badge info">Kỹ thuật / Thủ thuật</span>
                              ) : item.loaiXuat === 'XUAT_NOI_BO' ? (
                                <span
                                  className="excel-badge"
                                  style={{
                                    backgroundColor: '#f5f3ff',
                                    color: '#7c3aed',
                                    borderColor: '#ddd6fe',
                                  }}
                                >
                                  Nội bộ tiêu hao
                                </span>
                              ) : (
                                <span className="excel-badge">{item.loaiXuat}</span>
                              )}
                            </td>
                          );

                        case 'tenKhoXuat':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  color: '#475569',
                                  fontSize: 11.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                title={item.tenKhoXuat || 'Kho chính'}
                              >
                                <ShopOutlined style={{ color: '#94a3b8' }} />
                                <span>{item.tenKhoXuat || 'Kho chính'}</span>
                              </span>
                            </td>
                          );

                        case 'tenNguoiXuat':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  color: '#334155',
                                  fontSize: 11.5,
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                title={item.tenNguoiXuat || 'Hệ thống tự động'}
                              >
                                <UserOutlined style={{ color: '#94a3b8' }} />
                                <span>{item.tenNguoiXuat || 'Hệ thống tự động'}</span>
                              </span>
                            </td>
                          );

                        case 'ghiChu':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  color: '#475569',
                                  fontSize: 11.5,
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={item.ghiChu || '—'}
                              >
                                {item.ghiChu || '—'}
                              </span>
                            </td>
                          );

                        case 'soLuongMatHang':
                          return (
                            <td key={colKey} className="text-center font-mono" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '1px 6px',
                                  borderRadius: 3,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  backgroundColor: '#eff6ff',
                                  color: '#1d4ed8',
                                }}
                              >
                                {item.soLuongMatHang || 0} VT
                              </span>
                            </td>
                          );

                        case 'tongSoLuongXuat':
                          return (
                            <td
                              key={colKey}
                              className="text-right font-mono tabular-nums"
                              style={{ ...styles.cellEllipsis, color: '#0f172a', fontWeight: 700, fontSize: 11.5 }}
                              title={(item.tongSoLuongXuat ?? 0).toLocaleString('vi-VN')}
                            >
                              {(item.tongSoLuongXuat ?? 0).toLocaleString('vi-VN')}
                            </td>
                          );

                        case 'thaoTac':
                          return (
                            <td key={colKey} className="text-center">
                              <button
                                type="button"
                                onClick={() => handleViewDetail(item)}
                                style={styles.actionBtnView}
                                title="Xem chi tiết phiếu xuất"
                              >
                                <EyeOutlined style={{ fontSize: 11, marginRight: 3 }} />
                                <span>Chi tiết</span>
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
            Tổng số bản ghi: <strong>{total}</strong> phiếu xuất
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

      {/* ── DRAWER XEM CHI TIẾT PHIẾU XUẤT ───────────────────────────────────── */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#2563eb', fontSize: 16 }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Chi tiết phiếu xuất: {selectedExport?.maPhieu}
            </span>
          </div>
        }
        placement="right"
        width={720}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {selectedExport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Thẻ tóm tắt thông tin phiếu */}
            <div style={styles.drawerSummaryCard}>
              <Descriptions size="small" column={2} bordered>
                <Descriptions.Item label="Mã phiếu">
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                    {selectedExport.maPhieu}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian xuất">
                  {formatDateTime(selectedExport.ngayXuat)}
                </Descriptions.Item>
                <Descriptions.Item label="Loại xuất">
                  {selectedExport.loaiXuat === 'XUAT_THU_THUAT' ? (
                    <span className="excel-badge info">Kỹ thuật / Thủ thuật</span>
                  ) : (
                    <span className="excel-badge" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                      Nội bộ tiêu hao
                    </span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Kho xuất">
                  {selectedExport.tenKhoXuat || 'Kho chính'}
                </Descriptions.Item>
                <Descriptions.Item label="Người thực hiện">
                  {selectedExport.tenNguoiXuat || 'Hệ thống tự động'}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng số lượng">
                  <strong style={{ color: '#0b4f6c' }}>
                    {(selectedExport.tongSoLuongXuat ?? 0).toLocaleString('vi-VN')}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Diễn giải" span={2}>
                  {selectedExport.ghiChu || '—'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Bảng danh sách vật tư chi tiết */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                  Danh mục vật tư trong phiếu ({selectedExport.items?.length || 0} mặt hàng)
                </span>
              </div>

              <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', height: 32 }}>
                      <th style={styles.drawerThCenter}>STT</th>
                      <th style={styles.drawerTh}>TÊN VẬT TƯ / THUỐC</th>
                      <th style={styles.drawerThCenter}>LOẠI</th>
                      <th style={styles.drawerThCenter}>ĐVT</th>
                      <th style={styles.drawerTh}>SỐ LÔ / HSD</th>
                      <th style={styles.drawerThRight}>SỐ LƯỢNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedExport.items ?? []).map((it: ProcedureSupplyExportItemDto, idx: number) => (
                      <tr key={it.id || idx} style={{ borderBottom: '1px solid #e2e8f0', height: 36 }}>
                        <td style={styles.drawerTdCenter}>{idx + 1}</td>
                        <td style={styles.drawerTd}>
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{it.tenItem}</span>
                            <div style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'monospace' }}>
                              Mã: {it.maItemCode}
                            </div>
                          </div>
                        </td>
                        <td style={styles.drawerTdCenter}>
                          {it.loaiItem === 'THUOC' ? (
                            <span className="excel-badge info">Thuốc</span>
                          ) : (
                            <span className="excel-badge" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                              Vật tư
                            </span>
                          )}
                        </td>
                        <td style={styles.drawerTdCenter}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{it.donViTinh || 'Cái'}</span>
                        </td>
                        <td style={styles.drawerTd}>
                          <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
                            <div>Lô: <strong style={{ color: '#1d4ed8' }}>{it.soLo || '—'}</strong></div>
                            {it.hanSuDung && <div style={{ color: '#64748b' }}>HSD: {formatDate(it.hanSuDung)}</div>}
                          </div>
                        </td>
                        <td style={styles.drawerTdRight}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0b4f6c' }}>
                            {(it.soLuongXuat ?? 0).toLocaleString('vi-VN')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

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
    gap: 8,
  },
  filterSelect: {
    height: 32,
    padding: '0 8px',
    fontSize: 12,
    borderRadius: 5,
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#1e293b',
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
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: '1px solid #1d4ed8',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    height: 32,
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
  actionBtnView: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#2563eb',
    borderRadius: 4,
    padding: '3px 8px',
    fontSize: 11.5,
    fontWeight: 600,
    cursor: 'pointer',
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
  drawerSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  drawerTh: {
    padding: '6px 10px',
    textAlign: 'left',
    color: '#475569',
    fontWeight: 700,
    fontSize: 11,
    borderBottom: '1px solid #cbd5e1',
  },
  drawerThCenter: {
    padding: '6px 10px',
    textAlign: 'center',
    color: '#475569',
    fontWeight: 700,
    fontSize: 11,
    borderBottom: '1px solid #cbd5e1',
  },
  drawerThRight: {
    padding: '6px 10px',
    textAlign: 'right',
    color: '#475569',
    fontWeight: 700,
    fontSize: 11,
    borderBottom: '1px solid #cbd5e1',
  },
  drawerTd: {
    padding: '6px 10px',
    color: '#1e293b',
  },
  drawerTdCenter: {
    padding: '6px 10px',
    textAlign: 'center',
    color: '#475569',
  },
  drawerTdRight: {
    padding: '6px 10px',
    textAlign: 'right',
    color: '#1e293b',
  },
};

export default ProcedureSupplyExportPanel;
