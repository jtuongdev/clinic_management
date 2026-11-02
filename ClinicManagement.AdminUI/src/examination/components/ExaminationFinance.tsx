import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Modal, Tooltip } from 'antd';
import {
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  SearchOutlined,
  HolderOutlined,
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { dashboardApi, ExaminationFinanceDto } from '../../dashboard/api/dashboard.api';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

interface InvoiceItem {
  code: string;
  patient: string;
  total: string;
  remaining: string;
  status: 'unpaid' | 'partial' | 'paid';
}

type FinanceColKey =
  | 'stt'
  | 'code'
  | 'patient'
  | 'total'
  | 'remaining'
  | 'status'
  | 'action';

interface FinanceColumnDef {
  key: FinanceColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: FinanceColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'code', label: 'MÃ HÓA ĐƠN', align: 'left' },
  { key: 'patient', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'total', label: 'TỔNG CHI PHÍ', align: 'right' },
  { key: 'remaining', label: 'CÒN LẠI', align: 'right' },
  { key: 'status', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'action', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: FinanceColKey[] = [
  'stt',
  'code',
  'patient',
  'total',
  'remaining',
  'status',
  'action',
];

const ExaminationFinance: React.FC = () => {
  const [financeData, setFinanceData] = useState<ExaminationFinanceDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Bộ lọc
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Resize hook
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    code: 140,
    patient: 220,
    total: 150,
    remaining: 150,
    status: 150,
    action: 90,
  });

  // Reorder columns
  const [colOrder, setColOrder] = useState<FinanceColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<FinanceColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<FinanceColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: FinanceColKey) => {
    if (colKey === 'stt' || colKey === 'action') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: FinanceColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'action' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: FinanceColKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt' || targetCol === 'action') {
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

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getFinance({ facilityId: 1 });
      if (res.data?.success && res.data.data) {
        setFinanceData(res.data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const formatMillions = (val?: number) => {
    if (!val) return '0 tr';
    return (val / 1000000).toFixed(1) + ' tr';
  };

  const kpis = useMemo(() => {
    if (!financeData) return [];
    return [
      { label: 'Doanh thu tháng', value: formatMillions(financeData.kpis.revenue), color: '#0b4f6c', icon: <DollarCircleOutlined style={{ fontSize: 16, color: '#0b4f6c' }} /> },
      { label: 'Chưa thanh toán', value: formatMillions(financeData.kpis.unpaid), color: '#f59e0b', icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} /> },
      { label: 'Đã thanh toán', value: formatMillions(financeData.kpis.paid), color: '#10b981', icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#10b981' }} /> },
      { label: 'BHYT chi trả', value: formatMillions(financeData.kpis.insurance), color: '#0284c7', icon: <SafetyCertificateOutlined style={{ fontSize: 16, color: '#0284c7' }} /> },
      { label: 'Công nợ quá hạn', value: formatMillions(financeData.kpis.overdue), color: '#ef4444', icon: <WarningOutlined style={{ fontSize: 16, color: '#ef4444' }} /> },
      { label: 'Số hóa đơn', value: String(financeData.kpis.invoiceCount), color: '#8b5cf6', icon: <FileTextOutlined style={{ fontSize: 16, color: '#8b5cf6' }} /> },
    ];
  }, [financeData]);

  const rawInvoiceList: InvoiceItem[] = useMemo(() => {
    if (!financeData?.invoices) return [];
    return financeData.invoices.map((inv) => ({
      code: inv.code,
      patient: inv.patient,
      total: typeof inv.total === 'number' ? inv.total.toLocaleString('vi-VN') + ' đ' : inv.total,
      remaining: typeof inv.remaining === 'number' ? inv.remaining.toLocaleString('vi-VN') + ' đ' : inv.remaining,
      status: inv.status,
    }));
  }, [financeData]);

  // TDZ-safe: displayedItems before orderedItems
  const displayedItems = useMemo(() => {
    let list = rawInvoiceList;
    if (statusFilter) {
      list = list.filter((item) => item.status === statusFilter);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.code.toLowerCase().includes(kw) ||
          item.patient.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [rawInvoiceList, statusFilter, searchKeyword]);

  // Row reordering
  const [orderedItems, setOrderedItems] = useState<InvoiceItem[]>([]);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedItems(displayedItems);
  }, [displayedItems]);

  const handleRowDragStart = (e: React.DragEvent, code: string) => {
    setDraggedRowId(code);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRowDrop = (e: React.DragEvent, targetCode: string) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetCode) {
      setDraggedRowId(null);
      return;
    }
    const current = [...orderedItems];
    const fromIdx = current.findIndex((i) => i.code === draggedRowId);
    const toIdx = current.findIndex((i) => i.code === targetCode);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedItems(current);
    }
    setDraggedRowId(null);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setKeywordInput('');
    setStatusFilter('');
    setPageIndex(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(keywordInput);
    setPageIndex(1);
  };

  const renderCellContent = (colKey: FinanceColKey, item: InvoiceItem, index: number) => {
    switch (colKey) {
      case 'stt':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span title="Kéo thả đổi vị trí dòng" style={{ cursor: 'grab', color: '#94a3b8' }}>
              <HolderOutlined style={{ fontSize: 11 }} />
            </span>
            <span style={{ fontWeight: 600, color: '#475569' }}>
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        );

      case 'code':
        return (
          <span
            title={item.code}
            style={{
              fontWeight: 700,
              color: '#0b4f6c',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            {item.code}
          </span>
        );

      case 'patient':
        return (
          <span
            title={item.patient}
            style={{
              fontWeight: 600,
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.patient}
          </span>
        );

      case 'total':
        return (
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            {item.total}
          </span>
        );

      case 'remaining': {
        const isDebt = item.remaining !== '0 đ' && item.remaining !== '0';
        return (
          <span style={{ fontWeight: isDebt ? 700 : 500, color: isDebt ? '#ef4444' : '#64748b' }}>
            {item.remaining}
          </span>
        );
      }

      case 'status': {
        if (item.status === 'paid') return <Tag color="success" style={{ margin: 0, fontSize: 11 }}>Đã thanh toán</Tag>;
        if (item.status === 'partial') return <Tag color="warning" style={{ margin: 0, fontSize: 11 }}>Thanh toán 1 phần</Tag>;
        return <Tag color="error" style={{ margin: 0, fontSize: 11 }}>Chưa thanh toán</Tag>;
      }

      case 'action':
        return (
          <Tooltip title="Xem chi tiết hóa đơn">
            <button
              type="button"
              onClick={() => {
                Modal.info({
                  title: `Chi tiết hóa đơn ${item.code}`,
                  content: (
                    <div style={{ marginTop: 12 }}>
                      <p><strong>Bệnh nhân:</strong> {item.patient}</p>
                      <p><strong>Tổng tiền:</strong> {item.total}</p>
                      <p><strong>Còn lại:</strong> {item.remaining}</p>
                      <p><strong>Trạng thái:</strong> {item.status}</p>
                    </div>
                  ),
                });
              }}
              style={styles.actionIconButton}
            >
              <EyeOutlined style={{ color: '#0b4f6c' }} />
            </button>
          </Tooltip>
        );

      default:
        return null;
    }
  };

  const totalRecords = displayedItems.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedItems = orderedItems.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const startItemIdx = totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItemIdx = Math.min(pageIndex * pageSize, totalRecords);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: '#ffffff',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        maxHeight: isFullscreen ? '100vh' : '100%',
      }}
    >
      {/* ── KPI RIBBON ──────────────────────────────────────────────────────── */}
      {!isFullscreen && (
        <div style={styles.kpiRibbon}>
          {kpis.map((kpi, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />}
              <div style={styles.kpiItem}>
                {kpi.icon}
                <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>{kpi.value}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── HIGH DENSITY TOOLBAR ────────────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          {/* Search box with clear ✕ button */}
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <div style={styles.searchWrapper}>
              <SearchOutlined style={{ fontSize: 13, color: '#94a3b8' }} />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Tìm mã hóa đơn, bệnh nhân..."
                style={styles.searchInput}
              />
              {keywordInput && (
                <button
                  type="button"
                  onClick={() => {
                    setKeywordInput('');
                    setSearchKeyword('');
                  }}
                  style={styles.clearSearchBtn}
                  title="Xoá tìm kiếm"
                >
                  <CloseOutlined style={{ fontSize: 10 }} />
                </button>
              )}
            </div>
            <button type="submit" style={styles.btnPrimary}>
              Lọc
            </button>
          </form>

          {/* Filter: Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(1);
            }}
            style={styles.selectFilter}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="partial">Thanh toán 1 phần</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>

          {/* Button Đặt lại */}
          {(searchKeyword || keywordInput || statusFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={styles.btnReset}
              title="Khôi phục bộ lọc mặc định"
            >
              <CloseOutlined style={{ fontSize: 10 }} />
              <span>Đặt lại</span>
            </button>
          )}

          {/* Button Tải lại */}
          <button
            type="button"
            onClick={fetchFinance}
            style={styles.btnSecondary}
            title="Làm mới dữ liệu"
          >
            <ReloadOutlined style={{ fontSize: 12 }} />
            <span>Làm mới</span>
          </button>
        </div>

        <div style={styles.toolbarRight}>
          <span style={styles.summaryBadge}>
            Tổng: <strong>{totalRecords}</strong> hóa đơn
          </span>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={styles.btnSecondary}
            title={isFullscreen ? 'Thu nhỏ bảng' : 'Mở rộng bảng toàn màn hình'}
          >
            {isFullscreen ? <FullscreenExitOutlined style={{ fontSize: 12 }} /> : <FullscreenOutlined style={{ fontSize: 12 }} />}
            <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>
        </div>
      </div>

      {/* ── EXCEL DATA GRID CONTAINER (RESIZE, REORDER) ───────────────────────── */}
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
                  minWidth: colKey === 'action' ? colWidths.action : undefined,
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
                    <span>Đang nạp dữ liệu tài chính...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <FileTextOutlined style={{ fontSize: 28, color: '#94a3b8' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                      Không có hóa đơn nào phù hợp
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => {
                const isRowDragging = draggedRowId === item.code;
                return (
                  <tr
                    key={item.code}
                    className="h-9 hover:bg-slate-50 transition-colors"
                    style={{
                      opacity: isRowDragging ? 0.35 : 1,
                      backgroundColor: isRowDragging ? '#f1f5f9' : undefined,
                    }}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, item.code)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, item.code)}
                  >
                    {colOrder.map((colKey) => {
                      const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                      if (!colDef) return null;
                      return (
                        <td
                          key={colKey}
                          className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef.align}`}
                          style={{
                            width: colWidths[colKey] || 100,
                            padding: '4px 8px',
                            verticalAlign: 'middle',
                          }}
                        >
                          {renderCellContent(colKey, item, index)}
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

      {/* ── FOOTER PAGINATION BAR ────────────────────────────────────────────── */}
      <div style={styles.footerBar}>
        <div style={styles.footerLeft}>
          <span style={styles.pageInfo}>
            Hiển thị <strong>{startItemIdx}</strong> - <strong>{endItemIdx}</strong> /{' '}
            <strong>{totalRecords}</strong> hóa đơn
          </span>
        </div>

        <div style={styles.footerRight}>
          <div style={styles.pageSizeWrapper}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Cỡ trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
              style={styles.selectPageSize}
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
          </div>

          <div style={styles.paginationControls}>
            <button
              type="button"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              style={{
                ...styles.btnPageNav,
                opacity: pageIndex <= 1 ? 0.4 : 1,
                cursor: pageIndex <= 1 ? 'not-allowed' : 'pointer',
              }}
              title="Trang trước"
            >
              ‹ Trước
            </button>

            <span style={styles.pageIndicator}>
              Trang <strong>{pageIndex}</strong> / <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              style={{
                ...styles.btnPageNav,
                opacity: pageIndex >= totalPages ? 0.4 : 1,
                cursor: pageIndex >= totalPages ? 'not-allowed' : 'pointer',
              }}
              title="Trang sau"
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  kpiRibbon: {
    height: 40,
    minHeight: 40,
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    overflowX: 'auto',
    flexShrink: 0,
  },
  kpiItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
  toolbar: {
    minHeight: 44,
    padding: '6px 14px',
    borderBottom: '1px solid #e2e8f0',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
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
    gap: 10,
  },
  searchForm: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  searchWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '0 8px',
    height: 30,
    gap: 6,
    width: 220,
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 12,
    color: '#0f172a',
    width: '100%',
  },
  clearSearchBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  selectFilter: {
    height: 30,
    borderRadius: 5,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: 12,
    color: '#334155',
    padding: '0 8px',
    outline: 'none',
    cursor: 'pointer',
  },
  btnPrimary: {
    height: 30,
    padding: '0 10px',
    borderRadius: 5,
    border: 'none',
    background: '#0b4f6c',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  btnSecondary: {
    height: 30,
    padding: '0 10px',
    borderRadius: 5,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#334155',
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },
  btnReset: {
    height: 30,
    padding: '0 8px',
    borderRadius: 5,
    border: '1px dashed #ef4444',
    background: '#fef2f2',
    color: '#ef4444',
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  summaryBadge: {
    fontSize: 12,
    color: '#475569',
    background: '#f1f5f9',
    padding: '3px 8px',
    borderRadius: 4,
    border: '1px solid #e2e8f0',
  },
  gridContainer: {
    margin: '8px 12px 0 12px',
  },
  loadingCell: {
    padding: 40,
    textAlign: 'center',
    background: '#ffffff',
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#64748b',
    fontSize: 13,
  },
  emptyCell: {
    padding: 48,
    textAlign: 'center',
    background: '#ffffff',
  },
  emptyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 24,
    height: 24,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    background: '#ffffff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    fontSize: 12,
    transition: 'all 0.15s ease',
  },
  footerBar: {
    height: 40,
    minHeight: 40,
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  pageInfo: {
    fontSize: 12,
    color: '#64748b',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  pageSizeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  selectPageSize: {
    height: 26,
    borderRadius: 4,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: 12,
    color: '#334155',
    padding: '0 6px',
    outline: 'none',
    cursor: 'pointer',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  btnPageNav: {
    height: 26,
    padding: '0 8px',
    borderRadius: 4,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: 12,
    color: '#334155',
    cursor: 'pointer',
  },
  pageIndicator: {
    fontSize: 12,
    color: '#475569',
  },
};

export { ExaminationFinance };
export default ExaminationFinance;
