import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tooltip,
  App,
} from 'antd';
import {
  MedicineBoxOutlined,
  ReloadOutlined,
  PrinterOutlined,
  EyeOutlined,
  SearchOutlined,
  HolderOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  PendingPrescriptionDto,
  DispenseResult,
  PrescriptionPrintDto,
} from '../types/inventory.types';
import { inventoryApi } from '../api/inventory.api';
import PrescriptionPrintModal from './PrescriptionPrintModal';
import FefoPreviewModal from './FefoPreviewModal';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type DispenseColKey =
  | 'stt'
  | 'prescriptionCode'
  | 'visitId'
  | 'patient'
  | 'doctor'
  | 'prescribedAt'
  | 'payment'
  | 'status'
  | 'thaoTac';

interface DispenseColumnDef {
  key: DispenseColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: DispenseColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'prescriptionCode', label: 'MÃ ĐƠN', align: 'left' },
  { key: 'visitId', label: 'LƯỢT KHÁM', align: 'left' },
  { key: 'patient', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'doctor', label: 'BÁC SĨ KÊ', align: 'left' },
  { key: 'prescribedAt', label: 'NGÀY KÊ', align: 'center' },
  { key: 'payment', label: 'VIỆN PHÍ', align: 'center' },
  { key: 'status', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: DispenseColKey[] = [
  'stt',
  'prescriptionCode',
  'visitId',
  'patient',
  'doctor',
  'prescribedAt',
  'payment',
  'status',
  'thaoTac',
];

interface DispensePanelProps {
  onDispenseSuccess?: (result: DispenseResult) => void;
}

const DispensePanel: React.FC<DispensePanelProps> = ({ onDispenseSuccess }) => {
  const { message } = App.useApp();

  // ── State dữ liệu ──────────────────────────────────────────────────────────
  const [prescriptions, setPrescriptions] = useState<PendingPrescriptionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [dispensingId, setDispensingId] = useState<number | null>(null);

  // ── State phân trang & lọc ─────────────────────────────────────────────────
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterPaid, setFilterPaid] = useState<string>('');

  // ── Modal xem trước phân bổ FEFO ───────────────────────────────────────────
  const [previewPrescriptionId, setPreviewPrescriptionId] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [confirmingDispense, setConfirmingDispense] = useState(false);

  // ── Modal in đơn thuốc ─────────────────────────────────────────────────────
  const [printData, setPrintData] = useState<PrescriptionPrintDto | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    prescriptionCode: 135,
    visitId: 110,
    patient: 220,
    doctor: 160,
    prescribedAt: 115,
    payment: 155,
    status: 130,
    thaoTac: 145,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<DispenseColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<DispenseColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<DispenseColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: DispenseColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: DispenseColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: DispenseColKey) => {
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

  // ── Fetch dữ liệu đơn thuốc chờ cấp phát ──────────────────────────────────
  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getPendingPrescriptions({ pageIndex, pageSize });
      if (res.data.success) {
        setPrescriptions(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      } else {
        setPrescriptions([]);
        setTotal(0);
      }
    } catch {
      message.error('Không thể tải danh sách đơn thuốc chờ cấp phát');
      setPrescriptions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, message]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Client-side instant filter
  const displayedItems = useMemo(() => {
    let list = prescriptions;
    if (filterPaid === 'true') {
      list = list.filter((p) => p.isPaid === true);
    } else if (filterPaid === 'false') {
      list = list.filter((p) => p.isPaid === false);
    }
    if (!searchKeyword.trim()) return list;
    const kw = searchKeyword.trim().toLowerCase();
    return list.filter((p) => {
      const code = (p.prescriptionCode || `#${p.prescriptionId || p.id}`).toLowerCase();
      const patient = (p.patientName || '').toLowerCase();
      const pCode = (p.patientCode || '').toLowerCase();
      const doctor = (p.doctorName || '').toLowerCase();
      const visit = String(p.visitId || p.maLuotKham || '').toLowerCase();
      return (
        code.includes(kw) ||
        patient.includes(kw) ||
        pCode.includes(kw) ||
        doctor.includes(kw) ||
        visit.includes(kw)
      );
    });
  }, [prescriptions, filterPaid, searchKeyword]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<PendingPrescriptionDto[]>([]);
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

  // ── Xem/in đơn thuốc ──────────────────────────────────────────────────────
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

  // ── Xác nhận cấp phát FEFO ─────────────────────────────────────────────────
  const handleConfirmDispense = async (pId: number) => {
    setConfirmingDispense(true);
    setDispensingId(pId);
    try {
      const idempotencyKey = `DISP-${pId}-${Date.now()}`;
      const res = await inventoryApi.dispensePrescription(pId, idempotencyKey);
      if (res.data.success) {
        const result = res.data.data;
        message.success(`Đã cấp phát thành công đơn thuốc #${pId}`);
        setPreviewModalOpen(false);
        onDispenseSuccess?.(result);

        if (result.printData) {
          setPrintData(result.printData);
          setPrintModalOpen(true);
        } else {
          await handleOpenPrint(pId);
        }

        await fetchPending();
      } else {
        message.error(res.data.message || 'Cấp phát thất bại');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi cấp phát thuốc');
    } finally {
      setConfirmingDispense(false);
      setDispensingId(null);
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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={styles.panelContainer}>
      {/* ── TOOLBAR BỘ LỌC ──────────────────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <div style={styles.searchBox}>
            <SearchOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, bệnh nhân, BS..."
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
                <CloseOutlined style={{ fontSize: 10 }} />
              </button>
            )}
          </div>

          <select
            value={filterPaid}
            onChange={(e) => setFilterPaid(e.target.value)}
            style={{ ...styles.filterSelect, minWidth: 160 }}
          >
            <option value="">Tất cả viện phí</option>
            <option value="true">Đã thanh toán viện phí</option>
            <option value="false">Chưa thanh toán</option>
          </select>

          <button
            type="button"
            onClick={fetchPending}
            style={styles.btnSecondary}
            title="Tải lại danh sách"
          >
            <ReloadOutlined style={{ fontSize: 12 }} />
            <span>Làm mới</span>
          </button>
        </div>

        <div style={styles.toolbarRight}>
          <span style={styles.summaryBadge}>
            Đang chờ: <strong>{total}</strong> đơn thuốc
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
                    <span>Đang trích xuất đơn thuốc chờ cấp phát...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <MedicineBoxOutlined style={{ fontSize: 24, color: '#94a3b8' }} />
                    <strong style={{ color: '#475569' }}>Không có đơn thuốc nào đang chờ cấp phát</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Các đơn thuốc đã duyệt viện phí hoặc hoàn tất khám sẽ xuất hiện tại đây
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const sttNumber = (pageIndex - 1) * pageSize + index + 1;
                const pId = item.prescriptionId || item.id || 0;
                const code = item.prescriptionCode || `#${pId}`;
                const isDraggingRow = draggedRowIndex === index;
                const isDragOverRow = dragOverRowIndex === index;
                const canDispense = item.canDispense !== false;

                return (
                  <tr
                    key={pId || index}
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
                                onClick={() => {
                                  setPreviewPrescriptionId(pId);
                                  setPreviewModalOpen(true);
                                }}
                                title={`Bấm xem phân bổ FEFO đơn ${code}`}
                              >
                                {code}
                              </span>
                            </td>
                          );

                        case 'visitId':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <span style={{ color: '#475569', fontSize: 11.5 }}>
                                #{item.maLuotKham || item.visitId}
                              </span>
                            </td>
                          );

                        case 'patient':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    fontSize: 12,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={item.patientName || '—'}
                                >
                                  {item.patientName || '—'}
                                </span>
                                {item.patientCode && (
                                  <span style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'monospace' }}>
                                    {item.patientCode}
                                  </span>
                                )}
                              </div>
                            </td>
                          );

                        case 'doctor':
                          return (
                            <td
                              key={colKey}
                              className="text-left"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={item.doctorName || `BS #${item.maBacSi}`}
                            >
                              {item.doctorName || `BS #${item.maBacSi}`}
                            </td>
                          );

                        case 'prescribedAt':
                          return (
                            <td
                              key={colKey}
                              className="text-center font-mono"
                              style={{ ...styles.cellEllipsis, color: '#475569', fontSize: 11.5 }}
                              title={formatDate(item.ngayKe || item.prescribedAt)}
                            >
                              {formatDate(item.ngayKe || item.prescribedAt)}
                            </td>
                          );

                        case 'payment':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              {item.isPaid ? (
                                <span className="excel-badge success" title="Bệnh nhân đã thanh toán viện phí đầy đủ">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }} />
                                  ĐÃ THANH TOÁN
                                </span>
                              ) : (
                                <span className="excel-badge warning" title="Bệnh nhân chưa thanh toán viện phí tại quầy thu ngân">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#f59e0b' }} />
                                  CHƯA THANH TOÁN
                                </span>
                              )}
                            </td>
                          );

                        case 'status':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              <span className="excel-badge info">
                                Chờ cấp phát
                              </span>
                            </td>
                          );

                        case 'thaoTac':
                          return (
                            <td key={colKey} className="text-center">
                              <div style={styles.actionButtonGroup}>
                                <Tooltip
                                  title={
                                    !canDispense
                                      ? 'Bệnh nhân chưa thanh toán viện phí tại quầy thu ngân'
                                      : 'Xem trước phân bổ FEFO và xác nhận cấp phát'
                                  }
                                >
                                  <span>
                                    <button
                                      type="button"
                                      disabled={!canDispense || dispensingId === pId}
                                      onClick={() => {
                                        setPreviewPrescriptionId(pId);
                                        setPreviewModalOpen(true);
                                      }}
                                      style={
                                        canDispense
                                          ? styles.btnDispenseActive
                                          : styles.btnDispenseDisabled
                                      }
                                    >
                                      <EyeOutlined style={{ fontSize: 11 }} />
                                      <span>Cấp phát</span>
                                    </button>
                                  </span>
                                </Tooltip>

                                <button
                                  type="button"
                                  onClick={() => handleOpenPrint(pId)}
                                  style={styles.btnPrint}
                                  title="In đơn thuốc"
                                >
                                  <PrinterOutlined style={{ fontSize: 12 }} />
                                </button>
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

      {/* ── FOOTER PHÂN TRANG CỐ ĐỊNH DƯỚI CHÂN BẢNG ────────────────────────── */}
      <div style={styles.paginationFooter}>
        <div style={styles.paginationLeft}>
          <span>
            Tổng số bản ghi: <strong>{total}</strong> đơn thuốc
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

      {/* Modal xem trước phân bổ FEFO */}
      <FefoPreviewModal
        open={previewModalOpen}
        prescriptionId={previewPrescriptionId}
        onConfirmDispense={handleConfirmDispense}
        confirming={confirmingDispense}
        onCancel={() => {
          setPreviewModalOpen(false);
          setPreviewPrescriptionId(null);
        }}
      />

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

export default DispensePanel;

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
  btnSecondary: {
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
  btnDispenseActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    padding: '3px 8px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDispenseDisabled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    padding: '3px 8px',
    fontSize: 11,
    cursor: 'not-allowed',
  },
  btnPrint: {
    padding: '3px 7px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 12,
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
