import React, { useEffect, useMemo, useState } from 'react';
import {
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  CloseOutlined,
  FileTextOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import type { InternalDispenseDto, TrangThaiXuatNoiBo } from '../types/inventory.types';
import '../../styles/excel-grid.css';

type ColumnKey =
  | 'stt'
  | 'maItemCode'
  | 'tenItem'
  | 'soLo'
  | 'soLuongXuat'
  | 'donViTinh'
  | 'donGia'
  | 'thanhTien'
  | 'ghiChu';

interface ColumnDef {
  key: ColumnKey;
  label: string;
  align: 'left' | 'center' | 'right';
  sortable: boolean;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', sortable: false },
  { key: 'maItemCode', label: 'MÃ VT', align: 'center', sortable: true },
  { key: 'tenItem', label: 'TÊN VẬT TƯ / QUY CÁCH', align: 'left', sortable: true },
  { key: 'soLo', label: 'SỐ LÔ / HẠN DÙNG', align: 'center', sortable: true },
  { key: 'soLuongXuat', label: 'SL XUẤT', align: 'right', sortable: true },
  { key: 'donViTinh', label: 'ĐVT', align: 'center', sortable: true },
  { key: 'donGia', label: 'ĐƠN GIÁ', align: 'right', sortable: true },
  { key: 'thanhTien', label: 'THÀNH TIỀN', align: 'right', sortable: true },
  { key: 'ghiChu', label: 'GHI CHÚ DÒNG', align: 'left', sortable: true },
];

const DEFAULT_COLUMN_KEYS: ColumnKey[] = [
  'stt',
  'maItemCode',
  'tenItem',
  'soLo',
  'soLuongXuat',
  'donViTinh',
  'donGia',
  'thanhTien',
  'ghiChu',
];

interface Props {
  open: boolean;
  item: InternalDispenseDto | null;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number, maPhieu: string) => void;
  onConfirmReceived?: (id: number, ghiChu?: string) => void;
  actionLoading?: boolean;
}

export const InternalDispenseDetailModal: React.FC<Props> = ({
  open,
  item,
  onClose,
  onApprove,
  onReject,
  onConfirmReceived,
  actionLoading = false,
}) => {
  // Lắng nghe phím Esc để đóng nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Khóa cuộn trang bên dưới khi Full-screen view mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    maItemCode: 110,
    tenItem: 260,
    soLo: 170,
    soLuongXuat: 100,
    donViTinh: 75,
    donGia: 120,
    thanhTien: 135,
    ghiChu: 160,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(DEFAULT_COLUMN_KEYS);
  const [draggedCol, setDraggedCol] = useState<ColumnKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: ColumnKey) => {
    if (colKey === 'stt') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: ColumnKey) => {
    e.preventDefault();
    if (colKey === 'stt' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: ColumnKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt') {
      setDraggedCol(null);
      setDragOverCol(null);
      return;
    }

    const newOrder = [...columnOrder];
    const fromIndex = newOrder.indexOf(draggedCol);
    const toIndex = newOrder.indexOf(targetCol);
    if (fromIndex !== -1 && toIndex !== -1) {
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedCol);
      setColumnOrder(newOrder);
    }
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // ── Sắp xếp dữ liệu cột (Column Sorting) ──────────────────────────────────
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: ColumnKey) => {
    if (key === 'stt') return;
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  // ── Dữ liệu hàng & Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────
  const [rowList, setRowList] = useState<any[]>([]);

  useEffect(() => {
    if (item?.chiTiets) {
      setRowList([...item.chiTiets]);
    } else {
      setRowList([]);
    }
  }, [item?.chiTiets]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) return rowList;
    const { key, direction } = sortConfig;
    return [...rowList].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      if (key === 'thanhTien') {
        aVal = (Number(a.soLuongXuat) || 0) * (Number(a.donGia) || 0);
        bVal = (Number(b.soLuongXuat) || 0) * (Number(b.donGia) || 0);
      }
      if (aVal == null) return direction === 'asc' ? 1 : -1;
      if (bVal == null) return direction === 'asc' ? -1 : 1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal), 'vi')
        : String(bVal).localeCompare(String(aVal), 'vi');
    });
  }, [rowList, sortConfig]);

  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

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
    const updated = [...rowList];
    const [removed] = updated.splice(draggedRowIndex, 1);
    updated.splice(index, 0, removed);
    setRowList(updated);
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  // ── Modal xác nhận nhận hàng ──────────────────────────────────────────────
  const [confirmReceiveOpen, setConfirmReceiveOpen] = useState(false);
  const [confirmReceiveNote, setConfirmReceiveNote] = useState('');

  const handleOpenConfirmReceive = () => {
    setConfirmReceiveNote('');
    setConfirmReceiveOpen(true);
  };

  const handleDoConfirmReceive = () => {
    if (onConfirmReceived && item) {
      onConfirmReceived(item.id, confirmReceiveNote.trim() || undefined);
      setConfirmReceiveOpen(false);
    }
  };

  // ── Tính tổng cộng ────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    if (!rowList || rowList.length === 0) return { totalQty: 0, totalMoney: 0 };
    return rowList.reduce(
      (acc, row) => {
        const qty = Number(row.soLuongXuat || 0);
        const price = Number(row.donGia || 0);
        acc.totalQty += qty;
        acc.totalMoney += qty * price;
        return acc;
      },
      { totalQty: 0, totalMoney: 0 }
    );
  }, [rowList]);

  if (!open || !item) return null;

  const ts = item.trangThaiXuat as TrangThaiXuatNoiBo | null;

  const renderStatusBadge = () => {
    switch (ts) {
      case 'ChoDuyet':
        return (
          <span className="excel-badge warning" style={{ padding: '2px 10px', height: 24, fontSize: 11.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block', marginRight: 6 }} />
            Chờ duyệt
          </span>
        );
      case 'DaDuyet':
        return (
          <span className="excel-badge info" style={{ padding: '2px 10px', height: 24, fontSize: 11.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', display: 'inline-block', marginRight: 6 }} />
            Đã duyệt (Chờ nhận)
          </span>
        );
      case 'DaNhanHang':
        return (
          <span className="excel-badge success" style={{ padding: '2px 10px', height: 24, fontSize: 11.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block', marginRight: 6 }} />
            Đã nhận hàng
          </span>
        );
      case 'TuChoi':
        return (
          <span className="excel-badge danger" style={{ padding: '2px 10px', height: 24, fontSize: 11.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', display: 'inline-block', marginRight: 6 }} />
            Từ chối
          </span>
        );
      default:
        return (
          <span className="excel-badge" style={{ padding: '2px 10px', height: 24, fontSize: 11.5 }}>
            {item.trangThaiXuat || '—'}
          </span>
        );
    }
  };

  const formatDateTime = (val: string) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return val;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayRoom = item.tenPhongNhan || (
    item.ghiChu && item.ghiChu.toLowerCase().includes('phòng')
      ? item.ghiChu
      : 'Phòng chuyên môn / Bàn thủ thuật'
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden" style={styles.fullScreenOverlay}>
      {/* ── A. HEADER CỐ ĐỊNH TRÊN CÙNG (h-14) ────────────────────────────────── */}
      <header className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0" style={styles.topHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIconBox}>
            <FileTextOutlined style={{ fontSize: 18, color: '#1d4ed8' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={styles.headerTitle}>
                CHI TIẾT PHIẾU XUẤT VẬT TƯ NỘI BỘ
              </h2>
              <span style={styles.ticketCodeBadge}>
                {item.maPhieu}
              </span>
              {renderStatusBadge()}
            </div>
            <p style={styles.headerSubtitle}>
              Biên bản xuất kho điều chuyển vật tư tiêu hao nội bộ theo quy trình kiểm soát HIS
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button
            type="button"
            onClick={handlePrint}
            style={styles.actionBtnOutline}
            title="In biên bản bàn giao phiếu xuất"
          >
            <PrinterOutlined style={{ fontSize: 13 }} />
            <span>In biên bản</span>
          </button>

          {ts === 'ChoDuyet' && onReject && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onReject(item.id, item.maPhieu)}
              style={styles.actionBtnDanger}
            >
              <CloseCircleOutlined style={{ fontSize: 13 }} />
              <span>Từ chối</span>
            </button>
          )}

          {ts === 'ChoDuyet' && onApprove && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onApprove(item.id)}
              style={styles.actionBtnPrimary}
            >
              <CheckCircleOutlined style={{ fontSize: 13 }} />
              <span>{actionLoading ? 'Đang duyệt...' : 'Phê duyệt'}</span>
            </button>
          )}

          {ts === 'DaDuyet' && onConfirmReceived && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleOpenConfirmReceive}
              style={styles.actionBtnSuccess}
            >
              <InboxOutlined style={{ fontSize: 14 }} />
              <span>{actionLoading ? 'Đang xác nhận...' : 'Xác nhận nhận hàng'}</span>
            </button>
          )}

          <div style={styles.headerDivider} />

          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            title="Đóng cửa sổ (Esc)"
          >
            <CloseOutlined style={{ fontSize: 16 }} />
          </button>
        </div>
      </header>

      {/* ── B. KHỐI THÔNG TIN CHUNG (GRID 6 CỘT / 2 HÀNG COMPACT) ─────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4 bg-slate-50/50 border-b border-slate-200 text-xs shrink-0" style={styles.infoGrid}>
        {/* Hàng 1 */}
        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>MÃ PHIẾU XUẤT</span>
          <span className="font-mono" style={{ ...styles.infoValue, color: '#1e40af', fontWeight: 700 }}>
            {item.maPhieu}
          </span>
        </div>

        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>NGÀY LẬP PHIẾU</span>
          <span className="font-mono" style={styles.infoValue}>
            {formatDateTime(item.ngayLap)}
          </span>
        </div>

        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>KHOA NHẬN</span>
          <span style={{ ...styles.infoValue, color: '#0f172a' }}>
            {item.maKhoaCode && <span className="dept-code-tag">{item.maKhoaCode}</span>}
            {item.tenKhoaNhan || 'Khoa chuyên môn'}
          </span>
        </div>

        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>PHÒNG NHẬN / BÀN KHÁM</span>
          <span style={styles.infoValue} title={displayRoom}>
            {displayRoom}
          </span>
        </div>

        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>NGƯỜI LẬP (KHO)</span>
          <span style={styles.infoValue}>
            <strong>{item.nguoiLap || 'Admin kho'}</strong>
            <span style={styles.infoSubtext}>
              {item.chucDanhNguoiLap ? ` (${item.chucDanhNguoiLap})` : ' (Dược sĩ)'}
            </span>
          </span>
        </div>

        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>NGƯỜI NHẬN BÀN GIAO</span>
          <span style={styles.infoValue}>
            <strong>{item.tenNguoiNhan || 'Chưa bàn giao'}</strong>
            <span style={styles.infoSubtext}>
              {item.chucDanhNguoiNhan ? ` (${item.chucDanhNguoiNhan})` : ' (Trưởng Khoa)'}
            </span>
          </span>
        </div>

        {/* Hàng 2 */}
        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>TỔNG MẶT HÀNG</span>
          <span className="font-mono tabular-nums" style={{ ...styles.infoValue, color: '#334155' }}>
            <strong>{sortedRows.length}</strong> danh mục
          </span>
        </div>

        <div style={styles.infoCell}>
          <span style={styles.infoLabel}>TỔNG SL XUẤT</span>
          <span className="font-mono tabular-nums" style={{ ...styles.infoValue, color: '#059669', fontSize: 13, fontWeight: 700 }}>
            {totals.totalQty > 0 ? totals.totalQty.toLocaleString() : (item.tongSoLuong?.toLocaleString() ?? 0)}
          </span>
        </div>

        <div style={{ ...styles.infoCell, gridColumn: 'span 4' }}>
          <span style={styles.infoLabel}>GHI CHÚ ĐỢT CẤP PHÁT</span>
          <span style={{ ...styles.infoValue, color: item.ghiChu ? '#334155' : '#94a3b8', fontStyle: item.ghiChu ? 'normal' : 'italic' }}>
            {item.ghiChu || 'Không có ghi chú bổ sung'}
          </span>
        </div>
      </section>

      {/* ── C. BẢNG DANH SÁCH VẬT TƯ CHUẨN EXCEL DATA GRID ────────────────────── */}
      <main className="flex-1 min-h-0 w-full overflow-auto bg-white" style={styles.tableMain}>
        <table className="excel-table w-full min-w-full">
          <colgroup>
            {columnOrder.map((colKey) => (
              <col key={colKey} style={{ width: colWidths[colKey] || 100 }} />
            ))}
          </colgroup>

          {/* Sticky Header cố định trên cùng */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <tr className="h-9">
              {columnOrder.map((colKey) => {
                const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                if (!colDef) return null;
                const isSorted = sortConfig?.key === colKey;
                const isDragging = draggedCol === colKey;
                const isDragOver = dragOverCol === colKey;

                return (
                  <th
                    key={colKey}
                    className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef.align}`}
                    style={{
                      width: colWidths[colKey] || 100,
                      cursor: colDef.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      backgroundColor: isDragging ? '#e2e8f0' : undefined,
                      borderLeft: isDragOver ? '2px solid #2563eb' : undefined,
                    }}
                    draggable={colKey !== 'stt'}
                    onDragStart={(e) => handleColDragStart(e, colKey)}
                    onDragOver={(e) => handleColDragOver(e, colKey)}
                    onDrop={(e) => handleColDrop(e, colKey)}
                    onClick={() => colDef.sortable && handleSort(colKey)}
                    title={
                      colDef.sortable
                        ? `Bấm để sắp xếp theo ${colDef.label}. Kéo header để đổi vị trí cột.`
                        : 'Kéo header để đổi vị trí cột'
                    }
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
                      {colKey !== 'stt' && (
                        <HolderOutlined style={{ fontSize: 10, color: '#94a3b8', cursor: 'grab' }} />
                      )}
                      <span>{colDef.label}</span>
                      {colDef.sortable && (
                        <span style={{ fontSize: 10, color: isSorted ? '#2563eb' : '#94a3b8' }}>
                          {isSorted ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                    <div className="col-resizer" onMouseDown={(e) => startColResize(colKey, e)} />
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {!sortedRows || sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columnOrder.length} style={styles.emptyTable}>
                  Không có dòng mặt hàng nào trong phiếu xuất này.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => {
                const lineMoney = (Number(row.soLuongXuat) || 0) * (Number(row.donGia) || 0);
                const isDraggingRow = draggedRowIndex === idx;
                const isDragOverRow = dragOverRowIndex === idx;

                return (
                  <tr
                    key={row.id || idx}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, idx)}
                    onDragOver={(e) => handleRowDragOver(e, idx)}
                    onDrop={(e) => handleRowDrop(e, idx)}
                    className="hover:bg-blue-50/60 even:bg-slate-50/30"
                    style={{
                      transition: 'background-color 0.1s ease',
                      opacity: isDraggingRow ? 0.35 : 1,
                      borderTop: isDragOverRow ? '2px dashed #2563eb' : undefined,
                    }}
                  >
                    {columnOrder.map((colKey) => {
                      switch (colKey) {
                        case 'stt':
                          return (
                            <td key={colKey} className="col-stt text-center font-mono" style={{ cursor: 'grab' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                <HolderOutlined style={{ fontSize: 10, color: '#94a3b8' }} />
                                <span>{idx + 1}</span>
                              </div>
                            </td>
                          );

                        case 'maItemCode':
                          return (
                            <td key={colKey} className="text-center font-mono">
                              <span style={styles.itemCodeBadge}>
                                {row.maItemCode || `VT-${row.maItem || idx + 1}`}
                              </span>
                            </td>
                          );

                        case 'tenItem':
                          return (
                            <td key={colKey} className="text-left">
                              <span style={styles.itemNameText} title={row.tenItem}>
                                {row.tenItem || 'Vật tư tiêu hao y tế'}
                              </span>
                            </td>
                          );

                        case 'soLo':
                          return (
                            <td key={colKey} className="text-center font-mono" style={{ fontSize: 11 }}>
                              {row.soLo ? (
                                <div>
                                  <strong style={{ color: '#0f172a' }}>{row.soLo}</strong>
                                  {row.hanSuDung && (
                                    <span style={{ color: '#64748b', marginLeft: 4 }}>
                                      (HSD: {new Date(row.hanSuDung).toLocaleDateString('vi-VN')})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chờ gán lô</span>
                              )}
                            </td>
                          );

                        case 'soLuongXuat':
                          return (
                            <td key={colKey} className="text-right font-mono tabular-nums">
                              <strong style={{ fontSize: 13, color: '#0f172a' }}>
                                {row.soLuongXuat?.toLocaleString() ?? 0}
                              </strong>
                            </td>
                          );

                        case 'donViTinh':
                          return (
                            <td key={colKey} className="text-center" style={{ color: '#475569', fontSize: 11.5 }}>
                              {row.donViTinh || 'Cái'}
                            </td>
                          );

                        case 'donGia':
                          return (
                            <td key={colKey} className="text-right font-mono tabular-nums" style={{ color: '#475569' }}>
                              {row.donGia ? `${Number(row.donGia).toLocaleString()} đ` : '—'}
                            </td>
                          );

                        case 'thanhTien':
                          return (
                            <td key={colKey} className="text-right font-mono tabular-nums">
                              {lineMoney > 0 ? (
                                <strong style={{ color: '#1d4ed8' }}>
                                  {lineMoney.toLocaleString()} đ
                                </strong>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                          );

                        case 'ghiChu':
                          return (
                            <td key={colKey} className="text-left" style={{ color: '#64748b', fontSize: 11 }}>
                              {row.ghiChu || '—'}
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

          {/* Dòng Sticky Bottom Tổng cộng chuẩn kế toán */}
          {sortedRows && sortedRows.length > 0 && (
            <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15 }}>
              <tr style={styles.footerSummaryRow}>
                {columnOrder.map((colKey) => {
                  if (colKey === 'stt') {
                    return (
                      <td key={colKey} className="col-stt text-center font-bold" style={{ fontSize: 11 }}>
                        TỔNG
                      </td>
                    );
                  }
                  if (colKey === 'tenItem') {
                    return (
                      <td key={colKey} style={{ fontWeight: 700, color: '#334155' }}>
                        TỔNG CỘNG ({sortedRows.length} MẶT HÀNG)
                      </td>
                    );
                  }
                  if (colKey === 'soLuongXuat') {
                    return (
                      <td key={colKey} style={{ textAlign: 'right', padding: '8px 10px' }}>
                        <span className="font-mono tabular-nums" style={{ fontSize: 13.5, color: '#047857', fontWeight: 800 }}>
                          {totals.totalQty.toLocaleString()}
                        </span>
                      </td>
                    );
                  }
                  if (colKey === 'thanhTien') {
                    return (
                      <td key={colKey} style={{ textAlign: 'right', padding: '8px 10px' }}>
                        {totals.totalMoney > 0 ? (
                          <span className="font-mono tabular-nums" style={{ fontSize: 13.5, color: '#1e40af', fontWeight: 800 }}>
                            {totals.totalMoney.toLocaleString()} đ
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                    );
                  }
                  return <td key={colKey} />;
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </main>

      {/* ── D. STICKY FOOTER ACTIONS (h-14) ──────────────────────────────────── */}
      <footer className="h-14 px-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0" style={styles.bottomFooter}>
        <div style={styles.footerLeft}>
          <span style={styles.footerStatItem}>
            Danh mục: <strong style={{ color: '#0f172a' }}>{sortedRows.length}</strong> mặt hàng
          </span>
          <span style={styles.footerDot}>•</span>
          <span style={styles.footerStatItem}>
            Tổng SL: <strong style={{ color: '#047857' }}>{totals.totalQty.toLocaleString()}</strong> đơn vị
          </span>
          {totals.totalMoney > 0 && (
            <>
              <span style={styles.footerDot}>•</span>
              <span style={styles.footerStatItem}>
                Tổng giá trị: <strong style={{ color: '#1d4ed8' }}>{totals.totalMoney.toLocaleString()} đ</strong>
              </span>
            </>
          )}
        </div>

        <div style={styles.footerRight}>
          <button
            type="button"
            onClick={handlePrint}
            style={styles.footerBtnOutline}
            title="In biên bản bàn giao phiếu xuất"
          >
            <PrinterOutlined style={{ fontSize: 13 }} />
            <span>In biên bản bàn giao</span>
          </button>

          {ts === 'ChoDuyet' && onReject && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onReject(item.id, item.maPhieu)}
              style={styles.footerBtnDanger}
            >
              <CloseCircleOutlined style={{ fontSize: 13 }} />
              <span>Từ chối phiếu</span>
            </button>
          )}

          {ts === 'ChoDuyet' && onApprove && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onApprove(item.id)}
              style={styles.footerBtnPrimary}
            >
              <CheckCircleOutlined style={{ fontSize: 13 }} />
              <span>{actionLoading ? 'Đang duyệt...' : 'Phê duyệt xuất kho'}</span>
            </button>
          )}

          {ts === 'DaDuyet' && onConfirmReceived && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleOpenConfirmReceive}
              style={styles.footerBtnSuccess}
            >
              <InboxOutlined style={{ fontSize: 14 }} />
              <span>{actionLoading ? 'Đang xác nhận...' : 'Xác nhận nhận hàng'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            style={styles.footerBtnClose}
          >
            <span>Đóng (Esc)</span>
          </button>
        </div>
      </footer>

      {/* ── E. MODAL XÁC NHẬN NHẬN HÀNG KÈM GHI CHÚ ───────────────────────────── */}
      {confirmReceiveOpen && (
        <div style={styles.confirmModalBackdrop}>
          <div style={styles.confirmModalBox}>
            <div style={styles.confirmModalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={styles.confirmIconCircle}>
                  <InboxOutlined style={{ fontSize: 18, color: '#059669' }} />
                </div>
                <div>
                  <h3 style={styles.confirmModalTitle}>XÁC NHẬN ĐÃ NHẬN VẬT TƯ BÀN GIAO</h3>
                  <span style={styles.confirmModalSubtitle}>
                    Mã phiếu: <strong>{item.maPhieu}</strong> — Khoa: <strong>{item.tenKhoaNhan || 'Khoa nhận'}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmReceiveOpen(false)}
                style={styles.confirmCloseBtn}
              >
                <CloseOutlined style={{ fontSize: 14 }} />
              </button>
            </div>

            <div style={styles.confirmModalBody}>
              <div style={styles.confirmAlert}>
                Bạn đang xác nhận đã nhận đủ <strong>{totals.totalQty.toLocaleString()}</strong> đơn vị vật tư ({sortedRows.length} mặt hàng). Trạng thái phiếu sẽ chuyển sang <strong>Đã nhận hàng</strong>.
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={styles.confirmLabel}>
                  Ghi chú kiểm đếm / Tình trạng bàn giao (tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={confirmReceiveNote}
                  onChange={(e) => setConfirmReceiveNote(e.target.value)}
                  placeholder="Ví dụ: Đã kiểm đếm đầy đủ tem niêm phong, bao bì nguyên vẹn, số lô và hạn sử dụng đúng quy cách..."
                  style={styles.confirmTextarea}
                />
              </div>
            </div>

            <div style={styles.confirmModalFooter}>
              <button
                type="button"
                onClick={() => setConfirmReceiveOpen(false)}
                style={styles.confirmBtnCancel}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDoConfirmReceive}
                style={styles.confirmBtnSubmit}
              >
                <CheckCircleOutlined />
                <span>{actionLoading ? 'Đang cập nhật...' : 'Xác nhận hoàn tất'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  fullScreenOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  topHeader: {
    height: 56,
    padding: '0 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
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
  headerTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  ticketCodeBadge: {
    fontSize: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    fontWeight: 700,
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '2px 8px',
    borderRadius: 4,
  },
  headerSubtitle: {
    margin: '2px 0 0',
    fontSize: 11,
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#cbd5e1',
    margin: '0 4px',
  },
  actionBtnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 10,
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  infoCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  infoSubtext: {
    fontSize: 10.5,
    color: '#64748b',
  },
  tableMain: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
  },
  emptyTable: {
    padding: '48px 16px',
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  itemCodeBadge: {
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    fontWeight: 600,
    color: '#334155',
    backgroundColor: '#f1f5f9',
    padding: '1px 6px',
    borderRadius: 3,
    border: '1px solid #e2e8f0',
  },
  itemNameText: {
    fontWeight: 600,
    color: '#0f172a',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  footerSummaryRow: {
    backgroundColor: '#f1f5f9',
    fontWeight: 700,
    borderTop: '2px solid #94a3b8',
    color: '#1e293b',
    fontSize: 12,
  },
  bottomFooter: {
    height: 56,
    padding: '0 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    boxShadow: '0 -2px 4px 0 rgba(0, 0, 0, 0.02)',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#475569',
  },
  footerStatItem: {
    whiteSpace: 'nowrap',
  },
  footerDot: {
    color: '#cbd5e1',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  footerBtnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '7px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerBtnSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '7px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerBtnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerBtnClose: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '7px 16px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },
  confirmModalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 10001,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  confirmModalBox: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  confirmModalHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
  },
  confirmIconCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#d1fae5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  confirmModalTitle: {
    margin: 0,
    fontSize: 13.5,
    fontWeight: 700,
    color: '#0f172a',
  },
  confirmModalSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  confirmCloseBtn: {
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
  },
  confirmModalBody: {
    padding: '16px',
  },
  confirmAlert: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 12,
    lineHeight: 1.5,
  },
  confirmLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 6,
  },
  confirmTextarea: {
    width: '100%',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    padding: '8px 10px',
    fontSize: 12,
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  confirmModalFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  confirmBtnCancel: {
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  confirmBtnSubmit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 16px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
