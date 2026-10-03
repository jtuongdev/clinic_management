import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { App } from 'antd';
import {
  DatabaseOutlined,
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FallOutlined,
  HolderOutlined,
  CloseOutlined,
  RightOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { inventoryApi } from '../api/inventory.api';
import { StockDto, StockAlertDto, BatchDto } from '../types/inventory.types';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type StockFilterType = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

type StockColKey =
  | 'stt'
  | 'expander'
  | 'itemCode'
  | 'itemName'
  | 'itemType'
  | 'baseUnit'
  | 'totalStock'
  | 'minimumStock'
  | 'soLuongLo'
  | 'stockStatus';

interface StockColumnDef {
  key: StockColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: StockColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'expander', label: 'CHI TIẾT', align: 'center', isFixed: true },
  { key: 'itemCode', label: 'MÃ DƯỢC / VT', align: 'left' },
  { key: 'itemName', label: 'TÊN MẶT HÀNG', align: 'left' },
  { key: 'itemType', label: 'PHÂN LOẠI', align: 'center' },
  { key: 'baseUnit', label: 'ĐVT', align: 'center' },
  { key: 'totalStock', label: 'TỔNG TỒN', align: 'right' },
  { key: 'minimumStock', label: 'TỒN TỐI THIỂU', align: 'right' },
  { key: 'soLuongLo', label: 'SỐ LÔ', align: 'center' },
  { key: 'stockStatus', label: 'TRẠNG THÁI TỒN', align: 'center' },
];

const DEFAULT_COL_ORDER: StockColKey[] = [
  'stt',
  'expander',
  'itemCode',
  'itemName',
  'itemType',
  'baseUnit',
  'totalStock',
  'minimumStock',
  'soLuongLo',
  'stockStatus',
];

const daysRemaining = (hanSuDung: string | null): number | null => {
  if (!hanSuDung) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(hanSuDung);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const StockPage: React.FC = () => {
  const { message } = App.useApp();

  // ── State dữ liệu ──────────────────────────────────────────────────────────
  const [items, setItems] = useState<StockDto[]>([]);
  const [alerts, setAlerts] = useState<StockAlertDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // ── State bộ lọc & phân trang ──────────────────────────────────────────────
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // ── State mở rộng dòng chi tiết lô ─────────────────────────────────────────
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(new Set());

  // ── State tổng quan KPI ───────────────────────────────────────────────────
  const [summary, setSummary] = useState({
    totalCatalog: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    expander: 65,
    itemCode: 120,
    itemName: 280,
    itemType: 105,
    baseUnit: 80,
    totalStock: 120,
    minimumStock: 120,
    soLuongLo: 90,
    stockStatus: 130,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<StockColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<StockColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<StockColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: StockColKey) => {
    if (colKey === 'stt' || colKey === 'expander') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: StockColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'expander' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: StockColKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt' || targetCol === 'expander') {
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

  // ── Fetch dữ liệu tồn kho ─────────────────────────────────────────────────
  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getStock({
        keyword: keyword.trim() || undefined,
        stockStatus: stockFilter,
        pageIndex,
        pageSize,
      });
      if (res.data.success) {
        setItems(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
        if (res.data.data.totalCatalog !== undefined) {
          setSummary({
            totalCatalog: res.data.data.totalCatalog,
            inStockCount: res.data.data.inStockCount ?? 0,
            lowStockCount: res.data.data.lowStockCount ?? 0,
            outOfStockCount: res.data.data.outOfStockCount ?? 0,
          });
        }
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch {
      message.error('Không thể tải dữ liệu tồn kho.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, stockFilter, pageIndex, pageSize, message]);

  // ── Fetch dữ liệu cảnh báo hạn dùng ───────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await inventoryApi.getStockAlerts({ expiringWithinDays: 60 });
      if (res.data.success) setAlerts(res.data.data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const displayedItems = useMemo(() => {
    return items;
  }, [items]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<StockDto[]>([]);
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

  const toggleExpandRow = (itemId: number) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setKeyword(searchKeyword);
    setPageIndex(1);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setKeyword('');
    setStockFilter('ALL');
    setPageIndex(1);
  };

  // Tính số lượng lô cảnh báo
  const expiringCount = alerts.filter((a) => {
    if (!a.expiryDate) return false;
    const days = Math.floor((new Date(a.expiryDate).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 60;
  }).length;

  const expiredCount = alerts.filter((a) => {
    if (!a.expiryDate) return false;
    return new Date(a.expiryDate) < new Date();
  }).length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={styles.pageContainer}>
      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div style={styles.headerBar}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIconBox}>
            <DatabaseOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          </div>
          <div>
            <div style={styles.pageTitleWrapper}>
              <h1 style={styles.pageTitle}>Quản lý Tồn kho &amp; Hạn dùng</h1>
              <span style={styles.liveBadge}>GIÁM SÁT REALTIME</span>
            </div>
            <p style={styles.pageSubtitle}>
              Theo dõi biến động tồn kho, định mức tồn an toàn, chi tiết từng số lô và hạn sử dụng thuốc / vật tư
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => {
              fetchStock();
              fetchAlerts();
            }}
            style={styles.btnSecondary}
            title="Tải lại dữ liệu tồn kho"
          >
            <ReloadOutlined style={{ fontSize: 13 }} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ────────────────────────────────────────────────── */}
      <div style={styles.metricsContainer}>
        {/* Card 1: Có tồn kho */}
        <div
          style={{
            ...styles.metricCard,
            borderLeft: '4px solid #08979c',
            backgroundColor: stockFilter === 'IN_STOCK' ? '#e6fffb' : '#ffffff',
            cursor: 'pointer',
          }}
          onClick={() => {
            setStockFilter('IN_STOCK');
            setPageIndex(1);
          }}
          title="Bấm để lọc các mặt hàng đang có tồn"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#e6fffb', color: '#08979c' }}>
              <DatabaseOutlined style={{ fontSize: 16 }} />
            </div>
            <div>
              <div style={styles.metricLabel}>ĐANG CÓ TỒN KHO</div>
              <div style={{ ...styles.metricValue, color: '#08979c' }}>
                {summary.inStockCount}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>
                  / {summary.totalCatalog || total} danh mục
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tồn kho thấp */}
        <div
          style={{
            ...styles.metricCard,
            borderLeft: '4px solid #fa8c16',
            backgroundColor: stockFilter === 'LOW_STOCK' ? '#fff7e6' : '#ffffff',
            cursor: 'pointer',
          }}
          onClick={() => {
            setStockFilter('LOW_STOCK');
            setPageIndex(1);
          }}
          title="Bấm để lọc các mặt hàng có tồn thấp hơn mức tối thiểu"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#fff7e6', color: '#fa8c16' }}>
              <FallOutlined style={{ fontSize: 16 }} />
            </div>
            <div>
              <div style={styles.metricLabel}>TỒN KHO THẤP</div>
              <div style={{ ...styles.metricValue, color: '#fa8c16' }}>
                {summary.lowStockCount}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>mặt hàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Sắp hết hạn (60 ngày) */}
        <div
          style={{
            ...styles.metricCard,
            borderLeft: '4px solid #faad14',
            backgroundColor: '#ffffff',
          }}
          title="Số lô thuốc/vật tư có hạn dùng trong vòng 60 ngày tới"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#fffbe6', color: '#faad14' }}>
              <ClockCircleOutlined style={{ fontSize: 16 }} />
            </div>
            <div>
              <div style={styles.metricLabel}>SẮP HẾT HẠN (60 NGÀY)</div>
              <div style={{ ...styles.metricValue, color: '#d48806' }}>
                {expiringCount}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>lô</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Đã hết hạn còn tồn */}
        <div
          style={{
            ...styles.metricCard,
            borderLeft: '4px solid #f5222d',
            backgroundColor: expiredCount > 0 ? '#fff1f0' : '#ffffff',
          }}
          title="Lô thuốc/vật tư đã quá hạn sử dụng nhưng vẫn còn tồn kho"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#fff1f0', color: '#f5222d' }}>
              <WarningOutlined style={{ fontSize: 16 }} />
            </div>
            <div>
              <div style={styles.metricLabel}>ĐÃ HẾT HẠN (CÒN TỒN)</div>
              <div style={{ ...styles.metricValue, color: '#cf1322' }}>
                {expiredCount}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>lô nguy cơ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ──────────────────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <form onSubmit={handleSearchSubmit} style={styles.toolbarLeft}>
          <div style={styles.searchBox}>
            <SearchOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
            <input
              type="text"
              placeholder="Tìm theo mã, tên mặt hàng..."
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

          {/* Quick Segmented Status Filter Buttons */}
          <div style={styles.segmentedGroup}>
            <button
              type="button"
              onClick={() => {
                setStockFilter('ALL');
                setPageIndex(1);
              }}
              style={stockFilter === 'ALL' ? styles.segmentedBtnActive : styles.segmentedBtn}
            >
              Tất cả ({summary.totalCatalog || total})
            </button>
            <button
              type="button"
              onClick={() => {
                setStockFilter('IN_STOCK');
                setPageIndex(1);
              }}
              style={stockFilter === 'IN_STOCK' ? styles.segmentedBtnActive : styles.segmentedBtn}
            >
              Có tồn ({summary.inStockCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setStockFilter('LOW_STOCK');
                setPageIndex(1);
              }}
              style={stockFilter === 'LOW_STOCK' ? styles.segmentedBtnActive : styles.segmentedBtn}
            >
              Tồn thấp ({summary.lowStockCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setStockFilter('OUT_OF_STOCK');
                setPageIndex(1);
              }}
              style={stockFilter === 'OUT_OF_STOCK' ? styles.segmentedBtnActive : styles.segmentedBtn}
            >
              Hết hàng ({summary.outOfStockCount})
            </button>
          </div>

          <button type="submit" style={styles.filterBtn}>
            Lọc
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            style={styles.resetBtn}
            title="Đặt lại bộ lọc"
          >
            Đặt lại
          </button>
        </form>

        <div style={styles.toolbarRight}>
          {expiredCount > 0 && (
            <span style={styles.warningAlertPill}>
              <WarningOutlined /> Cảnh báo: Có {expiredCount} lô hết hạn
            </span>
          )}
          <span style={styles.summaryBadge}>
            Tổng: <strong>{total}</strong> mặt hàng
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
                  minWidth: colKey === 'expander' ? 65 : undefined,
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
                    <span>Đang trích xuất dữ liệu tồn kho...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <span style={{ fontSize: 24 }}>📭</span>
                    <strong style={{ color: '#475569' }}>Không tìm thấy mặt hàng tồn kho nào</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const sttNumber = (pageIndex - 1) * pageSize + index + 1;
                const isDraggingRow = draggedRowIndex === index;
                const isDragOverRow = dragOverRowIndex === index;
                const isExpanded = expandedRowIds.has(item.itemId);
                const batchCount = (item.batches ?? []).length;

                return (
                  <React.Fragment key={item.itemId}>
                    <tr
                      draggable
                      onDragStart={(e) => handleRowDragStart(e, index)}
                      onDragOver={(e) => handleRowDragOver(e, index)}
                      onDrop={(e) => handleRowDrop(e, index)}
                      className="hover:bg-blue-50/60 even:bg-slate-50/30"
                      style={{
                        transition: 'background-color 0.12s ease',
                        opacity: isDraggingRow ? 0.35 : 1,
                        borderTop: isDragOverRow ? '2px dashed #2563eb' : undefined,
                        backgroundColor: isExpanded ? '#f0f9ff' : undefined,
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

                          case 'expander':
                            return (
                              <td key={colKey} className="text-center" style={{ padding: '0 4px' }}>
                                {batchCount > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandRow(item.itemId)}
                                    style={styles.expandBtn}
                                    title={isExpanded ? 'Thu gọn chi tiết lô' : `Xem chi tiết ${batchCount} lô`}
                                  >
                                    {isExpanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
                                    <span style={{ fontSize: 10 }}>{batchCount}</span>
                                  </button>
                                ) : (
                                  <span style={{ color: '#cbd5e1', fontSize: 11 }}>—</span>
                                )}
                              </td>
                            );

                          case 'itemCode':
                            return (
                              <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: '#1d4ed8',
                                    fontSize: 11.5,
                                  }}
                                  title={item.itemCode}
                                >
                                  {item.itemCode}
                                </span>
                              </td>
                            );

                          case 'itemName':
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
                                  title={item.itemName}
                                >
                                  {item.itemName}
                                </span>
                              </td>
                            );

                          case 'itemType':
                            return (
                              <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                                {item.itemType === 'THUOC' ? (
                                  <span className="excel-badge info">Thuốc</span>
                                ) : (
                                  <span
                                    className="excel-badge"
                                    style={{
                                      backgroundColor: '#f5f3ff',
                                      color: '#7c3aed',
                                      borderColor: '#ddd6fe',
                                    }}
                                  >
                                    Vật tư
                                  </span>
                                )}
                              </td>
                            );

                          case 'baseUnit':
                            return (
                              <td
                                key={colKey}
                                className="text-center font-mono"
                                style={{ ...styles.cellEllipsis, color: '#0f172a', fontWeight: 600, fontSize: 11.5 }}
                                title={item.baseUnit || '—'}
                              >
                                {item.baseUnit || '—'}
                              </td>
                            );

                          case 'totalStock':
                            return (
                              <td
                                key={colKey}
                                className="text-right font-mono tabular-nums"
                                style={{
                                  ...styles.cellEllipsis,
                                  color: item.totalStock > 0 ? '#0b2a3c' : '#94a3b8',
                                  fontWeight: 700,
                                  fontSize: 12,
                                }}
                                title={item.totalStock.toLocaleString('vi-VN')}
                              >
                                {item.totalStock.toLocaleString('vi-VN')}
                              </td>
                            );

                          case 'minimumStock':
                            return (
                              <td
                                key={colKey}
                                className="text-right font-mono tabular-nums"
                                style={{ ...styles.cellEllipsis, color: '#64748b', fontSize: 11.5 }}
                                title={item.minimumStock.toLocaleString('vi-VN')}
                              >
                                {item.minimumStock.toLocaleString('vi-VN')}
                              </td>
                            );

                          case 'soLuongLo':
                            return (
                              <td key={colKey} className="text-center font-mono" style={styles.cellEllipsis}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '1px 6px',
                                    borderRadius: 3,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    backgroundColor: batchCount > 0 ? '#eff6ff' : '#f1f5f9',
                                    color: batchCount > 0 ? '#1d4ed8' : '#94a3b8',
                                  }}
                                >
                                  {batchCount} lô
                                </span>
                              </td>
                            );

                          case 'stockStatus':
                            return (
                              <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                                {item.totalStock <= 0 ? (
                                  <span className="excel-badge danger" title="Mặt hàng đã hết sạch trong kho">
                                    <span style={{ ...styles.statusDot, backgroundColor: '#ef4444' }} />
                                    Hết hàng
                                  </span>
                                ) : item.totalStock < item.minimumStock ? (
                                  <span className="excel-badge warning" title="Số lượng tồn dưới định mức an toàn">
                                    <span style={{ ...styles.statusDot, backgroundColor: '#f59e0b' }} />
                                    Tồn thấp
                                  </span>
                                ) : (
                                  <span className="excel-badge success" title="Số lượng tồn đảm bảo định mức an toàn">
                                    <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }} />
                                    Đủ hàng
                                  </span>
                                )}
                              </td>
                            );

                          default:
                            return null;
                        }
                      })}
                    </tr>

                    {/* Dòng mở rộng chi tiết các lô hàng */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-300">
                        <td colSpan={colOrder.length} style={{ padding: '8px 16px 12px 50px' }}>
                          <div style={styles.batchSubTableWrapper}>
                            <div style={styles.batchSubTableHeader}>
                              <span style={{ fontWeight: 700, fontSize: 12, color: '#1e293b' }}>
                                📦 Danh sách lô hàng chi tiết ({batchCount} lô)
                              </span>
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                Mặt hàng: <strong>[{item.itemCode}] {item.itemName}</strong>
                              </span>
                            </div>

                            <table style={styles.batchSubTable}>
                              <thead>
                                <tr style={{ backgroundColor: '#f1f5f9', height: 28 }}>
                                  <th style={styles.batchTh}>STT</th>
                                  <th style={styles.batchTh}>SỐ LÔ</th>
                                  <th style={styles.batchTh}>HẠN SỬ DỤNG</th>
                                  <th style={{ ...styles.batchTh, textAlign: 'right' }}>SỐ LƯỢNG</th>
                                  <th style={{ ...styles.batchTh, textAlign: 'center' }}>TÌNH TRẠNG HẠN DÙNG</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.batches.map((batch: BatchDto, bIdx: number) => {
                                  const days = daysRemaining(batch.expiryDate);
                                  const isExpired = days !== null && days < 0;
                                  const isExpiring = days !== null && days >= 0 && days < 30;

                                  return (
                                    <tr
                                      key={batch.stockId || bIdx}
                                      style={{
                                        backgroundColor: isExpired
                                          ? '#fff1f0'
                                          : isExpiring
                                          ? '#fffbe6'
                                          : '#ffffff',
                                        height: 30,
                                        borderBottom: '1px solid #e2e8f0',
                                      }}
                                    >
                                      <td style={{ ...styles.batchTd, textAlign: 'center', width: 40 }}>
                                        {bIdx + 1}
                                      </td>
                                      <td style={{ ...styles.batchTd, fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                                        {batch.batchNumber}
                                      </td>
                                      <td style={{ ...styles.batchTd, fontFamily: 'monospace' }}>
                                        {formatDate(batch.expiryDate)}
                                      </td>
                                      <td style={{ ...styles.batchTd, textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                                        {Number(batch.quantity ?? 0).toLocaleString('vi-VN')} {item.baseUnit}
                                      </td>
                                      <td style={{ ...styles.batchTd, textAlign: 'center' }}>
                                        {days === null ? (
                                          <span style={{ color: '#94a3b8', fontSize: 11 }}>Không áp dụng</span>
                                        ) : isExpired ? (
                                          <span className="excel-badge danger">
                                            Đã hết hạn {Math.abs(days)} ngày
                                          </span>
                                        ) : isExpiring ? (
                                          <span className="excel-badge warning">
                                            ⚠️ Còn {days} ngày
                                          </span>
                                        ) : (
                                          <span className="excel-badge success">
                                            Còn {days} ngày
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
            Tổng số bản ghi: <strong>{total}</strong> mặt hàng
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
    </div>
  );
};

export default StockPage;

// ── BẢNG STYLES TIÊU CHUẨN ĐỒNG BỘ ───────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    width: '100%',
    minWidth: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 10px',
    backgroundColor: '#f8fafc',
    gap: 8,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    flexShrink: 0,
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pageTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  liveBadge: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '1px 5px',
    borderRadius: 3,
    letterSpacing: '0.04em',
  },
  pageSubtitle: {
    margin: '2px 0 0',
    fontSize: 11.5,
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '7px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  metricsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 8,
    flexShrink: 0,
  },
  metricCard: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease',
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.02em',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.2,
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
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '0 8px',
    height: 32,
    minWidth: 220,
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
  segmentedGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  segmentedBtn: {
    border: 'none',
    background: 'transparent',
    padding: '4px 10px',
    fontSize: 11.5,
    fontWeight: 500,
    color: '#475569',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 0.12s ease',
  },
  segmentedBtnActive: {
    border: 'none',
    backgroundColor: '#ffffff',
    padding: '4px 10px',
    fontSize: 11.5,
    fontWeight: 700,
    color: '#1d4ed8',
    borderRadius: 4,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
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
  warningAlertPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '3px 8px',
    borderRadius: 4,
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
  expandBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    borderRadius: 4,
    padding: '2px 6px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  batchSubTableWrapper: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '8px 12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  batchSubTableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  batchSubTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 11.5,
  },
  batchTh: {
    padding: '4px 8px',
    textAlign: 'left',
    color: '#475569',
    fontWeight: 700,
    fontSize: 10.5,
    borderBottom: '1px solid #cbd5e1',
  },
  batchTd: {
    padding: '4px 8px',
    color: '#1e293b',
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
