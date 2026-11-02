import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { inventoryApi } from '../api/inventory.api';
import type {
  InternalDispenseDto,
  TrangThaiXuatNoiBo,
  DepartmentUsageStatDto,
} from '../types/inventory.types';
import { TaoYeuCauXuatNoiBoWorkspace } from '../components/TaoYeuCauXuatNoiBoWorkspace';
import { DepartmentUsageAuditCard } from '../components/DepartmentUsageAuditCard';
import { InternalDispenseDetailModal } from '../components/InternalDispenseDetailModal';
import { coSoApi } from '../../facility/api/facility.api';
import { khoaApi } from '../../department/api/department.api';
import type { CoSoDropdownDto } from '../../facility/type/facility.type';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import { message } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import '../../styles/excel-grid.css';

type MainColKey =
  | 'stt'
  | 'maPhieu'
  | 'ngayLap'
  | 'khoaNhan'
  | 'phongNhan'
  | 'nguoiLapNhan'
  | 'loaiMatHang'
  | 'tongSoLuong'
  | 'trangThai'
  | 'thaoTac';

interface MainColumnDef {
  key: MainColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_MAIN_COLUMNS: MainColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'maPhieu', label: 'MÃ PHIẾU', align: 'left' },
  { key: 'ngayLap', label: 'NGÀY LẬP', align: 'center' },
  { key: 'khoaNhan', label: 'KHOA NHẬN', align: 'left' },
  { key: 'phongNhan', label: 'PHÒNG NHẬN / BÀN KHÁM', align: 'left' },
  { key: 'nguoiLapNhan', label: 'NGƯỜI LẬP / NGƯỜI NHẬN', align: 'left' },
  { key: 'loaiMatHang', label: 'LOẠI MH', align: 'center' },
  { key: 'tongSoLuong', label: 'TỔNG SL XUẤT', align: 'right' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_MAIN_COL_ORDER: MainColKey[] = [
  'stt',
  'maPhieu',
  'ngayLap',
  'khoaNhan',
  'phongNhan',
  'nguoiLapNhan',
  'loaiMatHang',
  'tongSoLuong',
  'trangThai',
  'thaoTac',
];

// ── Status badge helpers chuẩn HIS ──────────────────────────────────────────
const STATUS_CONFIG: Record<
  TrangThaiXuatNoiBo,
  { label: string; badgeClass: string; dotColor: string }
> = {
  ChoDuyet:   { label: 'Chờ duyệt',   badgeClass: 'excel-badge warning', dotColor: '#d97706' },
  DaDuyet:    { label: 'Đã duyệt',    badgeClass: 'excel-badge info',    dotColor: '#2563eb' },
  DaNhanHang: { label: 'Đã nhận hàng', badgeClass: 'excel-badge success', dotColor: '#059669' },
  TuChoi:     { label: 'Từ chối',     badgeClass: 'excel-badge danger',  dotColor: '#dc2626' },
};

interface KhoaOption {
  id: number;
  ma?: string;
  ten: string;
}

// Lấy ngày đầu/cuối tháng hiện tại cho bộ lọc mặc định
const today = new Date();
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
const todayStr = today.toISOString().slice(0, 10);

const CapPhatKhoaPage: React.FC = () => {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [filterCoSo, setFilterCoSo] = useState<number>(0);
  const [filterKhoa, setFilterKhoa] = useState<number>(0);
  const [filterTrangThai, setFilterTrangThai] = useState<TrangThaiXuatNoiBo | ''>('');
  const [filterTuNgay, setFilterTuNgay] = useState(firstOfMonth);
  const [filterDenNgay, setFilterDenNgay] = useState(todayStr);
  const [searchKeyword, setSearchKeyword] = useState('');

  // ── Pagination state (25, 50, 100 dòng theo yêu cầu) ─────────────────────
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // ── Data state ────────────────────────────────────────────────────────────
  const [facilities, setFacilities] = useState<CoSoDropdownDto[]>([]);
  const [items, setItems] = useState<InternalDispenseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [khoas, setKhoas] = useState<KhoaOption[]>([]);

  // ── Audit card state ─────────────────────────────────────────────────────
  const [auditStats, setAuditStats] = useState<DepartmentUsageStatDto[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // ── Workspace / Modal state ───────────────────────────────────────────────
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmReject, setConfirmReject] = useState<{ id: number; maPhieu: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Detail Modal state
  const [detailItem, setDetailItem] = useState<InternalDispenseDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const DEFAULT_WAREHOUSE_ID = 1;

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    maPhieu: 200,
    ngayLap: 140,
    khoaNhan: 190,
    phongNhan: 160,
    nguoiLapNhan: 220,
    loaiMatHang: 110,
    tongSoLuong: 120,
    trangThai: 130,
    thaoTac: 180,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [mainColOrder, setMainColOrder] = useState<MainColKey[]>(DEFAULT_MAIN_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<MainColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<MainColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: MainColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: MainColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: MainColKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt' || targetCol === 'thaoTac') {
      setDraggedCol(null);
      setDragOverCol(null);
      return;
    }
    const newOrder = [...mainColOrder];
    const fromIdx = newOrder.indexOf(draggedCol);
    const toIdx = newOrder.indexOf(targetCol);
    if (fromIdx !== -1 && toIdx !== -1) {
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggedCol);
      setMainColOrder(newOrder);
    }
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // ── Load Cơ sở dropdown ──────────────────────────────────────────────────
  useEffect(() => {
    coSoApi
      .getDropdown()
      .then((res: any) => {
        const raw = res?.data;
        const list: CoSoDropdownDto[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];
        setFacilities(list);
        if (list.length > 0 && !filterCoSo) {
          setFilterCoSo(list[0].id);
        }
      })
      .catch((err) => {
        console.error('Lỗi nạp cơ sở cho trang cấp phát:', err);
      });
  }, []);

  // ── Load khoa dropdown via khoaApi theo cơ sở được chọn ───────────────────
  useEffect(() => {
    if (!filterCoSo) {
      setKhoas([]);
      return;
    }

    khoaApi
      .getDropdown(filterCoSo)
      .then((res: any) => {
        const raw = res?.data;
        const list: KhoaOption[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];
        setKhoas(list);
      })
      .catch((err) => {
        console.error('Lỗi nạp danh sách Khoa cho bộ lọc:', err);
        setKhoas([]);
      });
  }, [filterCoSo]);

  // ── Load danh sách phiếu ─────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getInternalDispenseList({
        maKhoa: filterKhoa || undefined,
        trangThai: filterTrangThai || undefined,
        tuNgay: filterTuNgay || undefined,
        denNgay: filterDenNgay || undefined,
        pageIndex,
        pageSize,
      });
      setItems(res.data.data?.items ?? []);
      setTotal(res.data.data?.total ?? 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filterKhoa, filterTrangThai, filterTuNgay, filterDenNgay, pageIndex, pageSize]);

  // ── Load audit stats ──────────────────────────────────────────────────────
  const fetchAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await inventoryApi.getDepartmentUsageStats({
        maKhoa: filterKhoa || undefined,
        tuNgay: filterTuNgay,
        denNgay: filterDenNgay,
      });
      setAuditStats(res.data.data?.items ?? []);
    } catch {
      setAuditStats([]);
    } finally {
      setAuditLoading(false);
    }
  }, [filterKhoa, filterTuNgay, filterDenNgay]);

  useEffect(() => {
    fetchList();
    fetchAudit();
  }, [fetchList, fetchAudit]);

  // Lọc client-side nhanh theo mã phiếu hoặc người nhận nếu nhập từ khóa tìm kiếm
  const displayedItems = useMemo(() => {
    if (!searchKeyword.trim()) return items;
    const kw = searchKeyword.trim().toLowerCase();
    return items.filter(
      (it) =>
        it.maPhieu?.toLowerCase().includes(kw) ||
        it.tenNguoiNhan?.toLowerCase().includes(kw) ||
        it.nguoiLap?.toLowerCase().includes(kw) ||
        it.tenKhoaNhan?.toLowerCase().includes(kw)
    );
  }, [items, searchKeyword]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<InternalDispenseDto[]>([]);
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

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleApprove = async (id: number) => {
    if (!window.confirm('Xác nhận phê duyệt phiếu và xuất kho trừ tồn theo nguyên tắc FEFO?')) return;
    setActionLoading(id);
    try {
      await inventoryApi.approveInternalDispense(id);
      fetchList();
      fetchAudit();
      if (detailOpen && detailItem?.id === id) {
        setDetailOpen(false);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Lỗi khi phê duyệt phiếu xuất.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReceived = async (id: number, ghiChu?: string) => {
    const rawUserId = localStorage.getItem('userId');
    const currentUserId = rawUserId ? Number(rawUserId) : undefined;
    const validUserId = currentUserId && currentUserId > 0 ? currentUserId : undefined;
    setActionLoading(id);
    try {
      await inventoryApi.confirmReceived(id, validUserId, ghiChu);
      message.success('Đã xác nhận nhận hàng thành công!');
      fetchList();
      if (detailOpen && detailItem?.id === id) {
        setDetailOpen(false);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Lỗi khi xác nhận nhận hàng.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirmReject) return;
    setActionLoading(confirmReject.id);
    try {
      await inventoryApi.rejectInternalDispense(confirmReject.id, rejectReason);
      setConfirmReject(null);
      setRejectReason('');
      fetchList();
      if (detailOpen && detailItem?.id === confirmReject.id) {
        setDetailOpen(false);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Lỗi khi từ chối phiếu xuất.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetFilters = () => {
    setFilterKhoa(0);
    setFilterTrangThai('');
    setFilterTuNgay(firstOfMonth);
    setFilterDenNgay(todayStr);
    setSearchKeyword('');
    setPageIndex(1);
  };

  const handleOpenDetail = (item: InternalDispenseDto) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  // Format ngày dd/MM/yyyy HH:mm chuẩn HIS
  const formatDateTime = (val: string) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = pad(d.getHours());
      const mins = pad(d.getMinutes());
      return `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      return val;
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="w-full min-w-full flex flex-col gap-2.5 px-3 py-2.5 bg-slate-50 h-[calc(100vh-115px)]" style={styles.pageContainer}>
      {/* ── HEADER THANH CÔNG CỤ TRÊN CÙNG ──────────────────────────────────── */}
      <div style={styles.headerBar}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIconBox}>
            <span style={{ fontSize: 18 }}>📦</span>
          </div>
          <div>
            <div style={styles.pageTitleWrapper}>
              <h1 style={styles.pageTitle}>XUẤT VẬT TƯ NỘI BỘ — KHOA / PHÒNG</h1>
              <span style={styles.liveBadge}>LIVE SYSTEM</span>
            </div>
            <p style={styles.pageSubtitle}>
              Cấp phát vật tư y tế &amp; tiêu hao từ Kho Tổng sang các Khoa / Phòng chức năng theo quy chuẩn HIS
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => { fetchList(); fetchAudit(); }}
            style={styles.btnSecondary}
            title="Tải lại dữ liệu"
          >
            <span>🔄 Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceOpen(true)}
            style={styles.btnPrimary}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>+</span> Lập phiếu xuất cấp phát
          </button>
        </div>
      </div>

      {/* ── KHỐI ĐỐI CHIẾU TIÊU HAO VẬT TƯ THEO KHOA/PHÒNG (COLLAPSIBLE) ───────── */}
      <DepartmentUsageAuditCard
        stats={auditStats}
        tuNgay={filterTuNgay}
        denNgay={filterDenNgay}
        loading={auditLoading}
      />

      {/* ── THANH CÔNG CỤ LỌC PHẲNG ĐỒNG NHẤT VỚI BẢNG (TOOLBAR) ──────────────── */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          {facilities.length > 1 && (
            <select
              value={filterCoSo}
              onChange={(e) => {
                setFilterCoSo(Number(e.target.value));
                setFilterKhoa(0);
                setPageIndex(1);
              }}
              style={styles.filterSelect}
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.ten || f.ma}</option>
              ))}
            </select>
          )}

          <select
            value={filterKhoa}
            onChange={(e) => {
              setFilterKhoa(Number(e.target.value));
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 170 }}
          >
            <option value={0}>Tất cả Khoa / Phòng</option>
            {khoas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ma ? `[${k.ma}] ` : ''}{k.ten}
              </option>
            ))}
          </select>

          <select
            value={filterTrangThai}
            onChange={(e) => {
              setFilterTrangThai(e.target.value as any);
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 140 }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ChoDuyet">Chờ duyệt</option>
            <option value="DaDuyet">Đã duyệt</option>
            <option value="DaNhanHang">Đã nhận hàng</option>
            <option value="TuChoi">Từ chối</option>
          </select>

          <div style={styles.dateFilterGroup}>
            <span style={styles.filterLabel}>Từ:</span>
            <input
              type="date"
              value={filterTuNgay}
              onChange={(e) => {
                setFilterTuNgay(e.target.value);
                setPageIndex(1);
              }}
              style={styles.filterDateInput}
            />
            <span style={styles.filterLabel}>Đến:</span>
            <input
              type="date"
              value={filterDenNgay}
              onChange={(e) => {
                setFilterDenNgay(e.target.value);
                setPageIndex(1);
              }}
              style={styles.filterDateInput}
            />
          </div>

          <div style={styles.searchBox}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm mã phiếu, người nhận..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={styles.searchInput}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                style={styles.clearSearchBtn}
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => { fetchList(); fetchAudit(); }}
            style={styles.filterBtn}
          >
            Lọc
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            style={styles.resetBtn}
            title="Đặt lại bộ lọc về mặc định"
          >
            Đặt lại
          </button>
        </div>

        <div style={styles.toolbarRight}>
          <span style={styles.summaryBadge}>
            Tổng: <strong>{total}</strong> phiếu xuất
          </span>
        </div>
      </div>

      {/* ── EXCEL DATA GRID CONTAINER (FULL WIDTH, COMPACT CELL, RESIZE) ─────── */}
      <div className="w-full flex-1 min-h-0 bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto overflow-y-auto excel-grid-container" style={styles.gridContainer}>
        <table className="excel-table w-full min-w-full">
          {/* Cột cố định chiều rộng chống giật layout */}
          <colgroup>
            {mainColOrder.map((colKey) => (
              <col
                key={colKey}
                style={{
                  width: colWidths[colKey] || 100,
                  minWidth: colKey === 'thaoTac' ? colWidths.thaoTac : undefined,
                }}
              />
            ))}
          </colgroup>

          {/* Sticky Header với màu nền xám nhạt bg-slate-100 */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 15 }}>
            <tr className="h-9">
              {mainColOrder.map((colKey) => {
                const colDef = ALL_MAIN_COLUMNS.find((c) => c.key === colKey);
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
                <td colSpan={mainColOrder.length} style={styles.loadingCell}>
                  <div style={styles.loadingWrapper}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang trích xuất dữ liệu phiếu xuất nội bộ...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={mainColOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <span style={{ fontSize: 24 }}>📭</span>
                    <strong style={{ color: '#475569' }}>Không tìm thấy phiếu xuất nào phù hợp</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Thử thay đổi khoảng ngày, chọn lại Khoa hoặc bấm nút "Đặt lại"
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const sttNumber = (pageIndex - 1) * pageSize + index + 1;
                const ts = item.trangThaiXuat as TrangThaiXuatNoiBo | null;
                const statusCfg = ts ? STATUS_CONFIG[ts] : {
                  label: item.trangThaiXuat || '—',
                  badgeClass: 'excel-badge',
                  dotColor: '#94a3b8',
                };
                const isItemActionLoading = actionLoading === item.id;
                const isDraggingRow = draggedRowIndex === index;
                const isDragOverRow = dragOverRowIndex === index;

                // Tên phòng nhận nếu có, hoặc trích xuất từ ghi chú
                const displayRoom = item.tenPhongNhan || (
                  item.ghiChu && item.ghiChu.toLowerCase().includes('phòng')
                    ? item.ghiChu
                    : 'Phòng chuyên môn'
                );

                return (
                  <tr
                    key={item.id}
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
                    {mainColOrder.map((colKey) => {
                      switch (colKey) {
                        case 'stt':
                          return (
                            <td key={colKey} className="col-stt text-center font-mono" style={{ cursor: 'grab' }} title="Bấm giữ để kéo thả đổi vị trí dòng">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                <HolderOutlined style={{ fontSize: 10, color: '#94a3b8' }} />
                                <span>{sttNumber}</span>
                              </div>
                            </td>
                          );

                        case 'maPhieu':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(item)}
                                style={styles.ticketCodeBtn}
                                title={`Bấm để xem chi tiết phiếu ${item.maPhieu}`}
                              >
                                {item.maPhieu}
                              </button>
                            </td>
                          );

                        case 'ngayLap':
                          return (
                            <td
                              key={colKey}
                              className="text-center font-mono"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={formatDateTime(item.ngayLap)}
                            >
                              {formatDateTime(item.ngayLap)}
                            </td>
                          );

                        case 'khoaNhan':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}
                                title={`${item.maKhoaCode ? `[${item.maKhoaCode}] ` : ''}${item.tenKhoaNhan || 'Khoa lâm sàng'}`}
                              >
                                {item.maKhoaCode && (
                                  <span className="dept-code-tag" style={{ flexShrink: 0 }}>
                                    {item.maKhoaCode}
                                  </span>
                                )}
                                <span style={{ fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.tenKhoaNhan || 'Khoa lâm sàng'}
                                </span>
                              </div>
                            </td>
                          );

                        case 'phongNhan':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <span
                                style={{ color: '#475569', fontSize: 11.5, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={displayRoom}
                              >
                                {displayRoom}
                              </span>
                            </td>
                          );

                        case 'nguoiLapNhan':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <div
                                style={styles.userCluster}
                                title={`Lập: ${item.nguoiLap || 'Admin kho'} | Nhận: ${item.tenNguoiNhan || 'Chưa bàn giao'}`}
                              >
                                <div style={styles.userRow}>
                                  <span style={styles.userRoleTag}>Lập:</span>
                                  <span style={{ ...styles.userName, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.nguoiLap || 'Admin kho'}
                                  </span>
                                  <span style={styles.userTitle}>
                                    {item.chucDanhNguoiLap ? `(${item.chucDanhNguoiLap})` : '(Dược sĩ)'}
                                  </span>
                                </div>
                                <div style={styles.userRow}>
                                  <span style={{ ...styles.userRoleTag, background: '#f1f5f9', color: '#475569' }}>Nhận:</span>
                                  <span style={{ ...styles.userName, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.tenNguoiNhan || 'Chưa bàn giao'}
                                  </span>
                                  <span style={styles.userTitle}>
                                    {item.chucDanhNguoiNhan ? `(${item.chucDanhNguoiNhan})` : '(Điều dưỡng)'}
                                  </span>
                                </div>
                              </div>
                            </td>
                          );

                        case 'loaiMatHang':
                          return (
                            <td key={colKey} className="text-center font-mono tabular-nums" style={styles.cellEllipsis}>
                              <span style={styles.matHangBadge} title={`${item.tongMatHang} mặt hàng trong phiếu`}>
                                {item.tongMatHang} MH
                              </span>
                            </td>
                          );

                        case 'tongSoLuong':
                          return (
                            <td key={colKey} className="text-right font-mono tabular-nums" style={styles.cellEllipsis}>
                              <strong
                                style={{ fontSize: 13, color: '#0f172a' }}
                                title={`Tổng SL: ${item.tongSoLuong?.toLocaleString() ?? 0}`}
                              >
                                {item.tongSoLuong?.toLocaleString() ?? 0}
                              </strong>
                            </td>
                          );

                        case 'trangThai':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              <span className={statusCfg.badgeClass} title={`Trạng thái: ${statusCfg.label}`}>
                                <span style={{ ...styles.statusDot, backgroundColor: statusCfg.dotColor }} />
                                {statusCfg.label}
                              </span>
                            </td>
                          );

                        case 'thaoTac':
                          return (
                            <td key={colKey} className="text-center" style={{ overflow: 'visible', whiteSpace: 'nowrap' }}>
                              <div style={styles.actionButtonGroup}>
                                {/* Nút xem chi tiết */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(item)}
                                  style={styles.viewDetailBtn}
                                  title="Xem chi tiết phiếu và các dòng vật tư"
                                >
                                  👁
                                </button>

                                {/* Nút Phê duyệt / Từ chối nếu Chờ duyệt */}
                                {ts === 'ChoDuyet' && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isItemActionLoading}
                                      onClick={() => handleApprove(item.id)}
                                      style={styles.approveBtn}
                                      title="Phê duyệt xuất kho theo FEFO"
                                    >
                                      {isItemActionLoading ? '...' : '✓ Duyệt'}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isItemActionLoading}
                                      onClick={() => setConfirmReject({ id: item.id, maPhieu: item.maPhieu })}
                                      style={styles.rejectBtn}
                                      title="Từ chối yêu cầu cấp phát"
                                    >
                                      ✕
                                    </button>
                                  </>
                                )}

                                {/* Nút Xác nhận nhận hàng nếu Đã duyệt */}
                                {ts === 'DaDuyet' && (
                                  <button
                                    type="button"
                                    disabled={isItemActionLoading}
                                    onClick={() => handleConfirmReceived(item.id)}
                                    style={styles.receiveBtn}
                                    title="Xác nhận Khoa/Phòng đã nhận đủ hàng"
                                  >
                                    {isItemActionLoading ? '...' : '📦 Nhận hàng'}
                                  </button>
                                )}
                              </div>
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

      {/* ── FOOTER PHÂN TRANG CỐ ĐỊNH DƯỚI CHÂN BẢNG (PAGINATION) ──────────────── */}
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
              <option value={25}>25 dòng</option>
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

      {/* ── WORKSPACE TOÀN MÀN HÌNH TẠO YÊU CẦU CẤP PHÁT ─────────────────────── */}
      <TaoYeuCauXuatNoiBoWorkspace
        open={workspaceOpen}
        defaultWarehouseId={DEFAULT_WAREHOUSE_ID}
        onClose={() => setWorkspaceOpen(false)}
        onSuccess={() => {
          fetchList();
          fetchAudit();
        }}
      />

      {/* ── MODAL XEM CHI TIẾT PHIẾU XUẤT ─────────────────────────────────────── */}
      <InternalDispenseDetailModal
        open={detailOpen}
        item={detailItem}
        onClose={() => setDetailOpen(false)}
        onApprove={handleApprove}
        onReject={(id, maPhieu) => setConfirmReject({ id, maPhieu })}
        onConfirmReceived={handleConfirmReceived}
        actionLoading={actionLoading !== null}
      />

      {/* ── MODAL XÁC NHẬN TỪ CHỐI PHIẾU ──────────────────────────────────────── */}
      {confirmReject && (
        <div style={styles.overlay}>
          <div style={styles.rejectDialog}>
            <div style={styles.rejectHeader}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#991b1b' }}>
                Xác nhận từ chối phiếu xuất {confirmReject.maPhieu}
              </h3>
            </div>

            <p style={{ fontSize: 12, color: '#475569', margin: '8px 0 12px' }}>
              Vui lòng nhập lý do từ chối để thông báo cho Khoa / Phòng gửi yêu cầu:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Tồn kho hiện không đủ đáp ứng, đề nghị điều chỉnh số lượng hoặc hoãn lịch..."
              style={styles.rejectTextarea}
            />

            <div style={styles.rejectActions}>
              <button
                type="button"
                onClick={() => {
                  setConfirmReject(null);
                  setRejectReason('');
                }}
                style={styles.cancelBtn}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={handleReject}
                style={styles.confirmRejectBtn}
              >
                {actionLoading !== null ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    width: '100%',
    minWidth: '100%',
    height: 'calc(100vh - 115px)',
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
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: '1px solid #1d4ed8',
    borderRadius: 6,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(37, 99, 235, 0.2)',
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
  filterSelect: {
    height: 32,
    padding: '0 8px',
    fontSize: 12,
    borderRadius: 5,
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  dateFilterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '0 8px',
    height: 32,
  },
  filterLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 500,
  },
  filterDateInput: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: 11.5,
    color: '#1e293b',
    outline: 'none',
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
    minWidth: 180,
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
  ticketCodeBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: '#1d4ed8',
    fontWeight: 700,
    fontSize: 11.5,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  },
  userCluster: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
  },
  userRoleTag: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    padding: '0 3px',
    borderRadius: 2,
  },
  userName: {
    fontWeight: 600,
    color: '#1e293b',
  },
  userTitle: {
    fontSize: 10,
    color: '#64748b',
  },
  matHangBadge: {
    display: 'inline-block',
    fontSize: 11,
    color: '#334155',
    backgroundColor: '#f1f5f9',
    padding: '1px 6px',
    borderRadius: 3,
    border: '1px solid #e2e8f0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    marginRight: 5,
    display: 'inline-block',
  },
  actionButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewDetailBtn: {
    padding: '3px 7px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 12,
    color: '#334155',
    cursor: 'pointer',
  },
  approveBtn: {
    padding: '3px 8px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  rejectBtn: {
    padding: '3px 7px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
  receiveBtn: {
    padding: '3px 8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    fontSize: 11,
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
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(2px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectDialog: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    width: 440,
    maxWidth: '90vw',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #cbd5e1',
  },
  rejectHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  rejectTextarea: {
    width: '100%',
    padding: 8,
    fontSize: 12,
    borderRadius: 5,
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
  },
  rejectActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  cancelBtn: {
    padding: '6px 14px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    fontSize: 12,
    cursor: 'pointer',
  },
  confirmRejectBtn: {
    padding: '6px 14px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default CapPhatKhoaPage;
