import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { App, Modal, Form, Input } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  RetweetOutlined,
  ReloadOutlined,
  ShopOutlined,
  HolderOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { inventoryApi } from '../api/inventory.api';
import { SupplierDto, SupplierRequest } from '../types/inventory.types';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type SupplierColKey =
  | 'stt'
  | 'ma'
  | 'ten'
  | 'dienThoai'
  | 'email'
  | 'maSoThue'
  | 'diaChi'
  | 'trangThai'
  | 'thaoTac';

interface SupplierColumnDef {
  key: SupplierColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: SupplierColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'ma', label: 'MÃ NCC', align: 'left' },
  { key: 'ten', label: 'TÊN NHÀ CUNG CẤP', align: 'left' },
  { key: 'dienThoai', label: 'ĐIỆN THOẠI', align: 'left' },
  { key: 'email', label: 'EMAIL', align: 'left' },
  { key: 'maSoThue', label: 'MÃ SỐ THUẾ', align: 'left' },
  { key: 'diaChi', label: 'ĐỊA CHỈ', align: 'left' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: SupplierColKey[] = [
  'stt',
  'ma',
  'ten',
  'dienThoai',
  'email',
  'maSoThue',
  'diaChi',
  'trangThai',
  'thaoTac',
];

export const SupplierPage: React.FC = () => {
  const { message } = App.useApp();

  // ── Data & Filter state ──────────────────────────────────────────────────
  const [data, setData] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [status, setStatus] = useState<1 | 2 | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplierDto | null>(null);
  const [form] = Form.useForm<SupplierRequest>();

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    ma: 110,
    ten: 260,
    dienThoai: 130,
    email: 190,
    maSoThue: 130,
    diaChi: 280,
    trangThai: 130,
    thaoTac: 110,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<SupplierColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<SupplierColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<SupplierColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: SupplierColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: SupplierColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: SupplierColKey) => {
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

  // ── Nạp danh sách từ API ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getSuppliers({
        keyword: keyword.trim() || undefined,
        status,
        pageIndex,
        pageSize,
      });
      if (res.data?.success && res.data.data) {
        setData(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch {
      message.error('Lỗi khi tải danh sách nhà cung cấp');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, status, pageIndex, pageSize, message]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side quick filter
  const displayedItems = useMemo(() => {
    return data;
  }, [data]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<SupplierDto[]>([]);
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

  // ── Modal Actions ────────────────────────────────────────────────────────
  const showModal = (item?: SupplierDto) => {
    setEditingItem(item || null);
    if (item) {
      form.setFieldsValue({
        ma: item.ma,
        ten: item.ten,
        diaChi: item.diaChi,
        dienThoai: item.dienThoai,
        email: item.email,
        maSoThue: item.maSoThue,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editingItem) {
        await inventoryApi.updateSupplier(editingItem.id, values);
        message.success('Cập nhật nhà cung cấp thành công');
      } else {
        await inventoryApi.createSupplier(values);
        message.success('Thêm nhà cung cấp thành công');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error: any) {
      if (error?.errorFields) return; // Validation error
      message.error(error?.response?.data?.message ?? 'Có lỗi xảy ra khi lưu nhà cung cấp');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await inventoryApi.toggleSupplierStatus(id);
      message.success('Đã thay đổi trạng thái nhà cung cấp');
      fetchData();
    } catch {
      message.error('Có lỗi xảy ra khi chuyển trạng thái');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setKeyword(searchKeyword);
    setPageIndex(1);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setKeyword('');
    setStatus(undefined);
    setPageIndex(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={styles.pageContainer}>
      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div style={styles.headerBar}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIconBox}>
            <ShopOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          </div>
          <div>
            <div style={styles.pageTitleWrapper}>
              <h1 style={styles.pageTitle}>Danh mục Nhà cung cấp</h1>
              <span style={styles.liveBadge}>ĐỐI TÁC Y TẾ</span>
            </div>
            <p style={styles.pageSubtitle}>
              Quản lý thông tin đối tác cung ứng thuốc, vật tư tiêu hao, hóa đơn và thông tin liên hệ
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={fetchData}
            style={styles.btnSecondary}
            title="Tải lại danh sách"
          >
            <ReloadOutlined style={{ fontSize: 13 }} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => showModal()}
            style={styles.btnPrimary}
            title="Thêm mới nhà cung cấp"
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            <span>Thêm nhà cung cấp</span>
          </button>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ──────────────────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <form onSubmit={handleSearchSubmit} style={styles.toolbarLeft}>
          <div style={styles.searchBox}>
            <SearchOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, SĐT, MST..."
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
            value={status === undefined ? '' : status}
            onChange={(e) => {
              const val = e.target.value;
              setStatus(val === '' ? undefined : (Number(val) as 1 | 2));
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 150 }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="2">Ngừng hợp tác</option>
          </select>

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
          <span style={styles.summaryBadge}>
            Tổng: <strong>{total}</strong> nhà cung cấp
          </span>
        </div>
      </div>

      {/* ── EXCEL DATA GRID CONTAINER (FULL WIDTH, RESIZE, REORDER) ─────────── */}
      <div
        className="w-full flex-1 min-h-0 bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto overflow-y-auto excel-grid-container"
        style={styles.gridContainer}
      >
        <table className="excel-table w-full min-w-full">
          {/* Cột cố định chiều rộng chống giật layout */}
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
                    <span>Đang tải danh sách nhà cung cấp...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <span style={{ fontSize: 24 }}>📭</span>
                    <strong style={{ color: '#475569' }}>Không tìm thấy nhà cung cấp nào</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Đặt lại"
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const sttNumber = (pageIndex - 1) * pageSize + index + 1;
                const isActive = item.trangThai === 1 || item.trangThai === 'HoatDong';
                const isDraggingRow = draggedRowIndex === index;
                const isDragOverRow = dragOverRowIndex === index;

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

                        case 'ma':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  fontSize: 11.5,
                                  cursor: 'pointer',
                                }}
                                onClick={() => showModal(item)}
                                title={`Bấm để chỉnh sửa ${item.ma}`}
                              >
                                {item.ma}
                              </span>
                            </td>
                          );

                        case 'ten':
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
                                title={item.ten}
                              >
                                {item.ten}
                              </span>
                            </td>
                          );

                        case 'dienThoai':
                          return (
                            <td
                              key={colKey}
                              className="text-left font-mono"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={item.dienThoai || '—'}
                            >
                              {item.dienThoai || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'email':
                          return (
                            <td
                              key={colKey}
                              className="text-left font-mono"
                              style={{ ...styles.cellEllipsis, color: '#475569', fontSize: 11.5 }}
                              title={item.email || '—'}
                            >
                              {item.email || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'maSoThue':
                          return (
                            <td
                              key={colKey}
                              className="text-left font-mono"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={item.maSoThue || '—'}
                            >
                              {item.maSoThue || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'diaChi':
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
                                title={item.diaChi || '—'}
                              >
                                {item.diaChi || <span style={{ color: '#94a3b8' }}>—</span>}
                              </span>
                            </td>
                          );

                        case 'trangThai':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              {isActive ? (
                                <span className="excel-badge success" title="Nhà cung cấp đang hoạt động bình thường">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }} />
                                  Hoạt động
                                </span>
                              ) : (
                                <span className="excel-badge danger" title="Tạm ngừng nhập hàng từ nhà cung cấp này">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#ef4444' }} />
                                  Ngừng hợp tác
                                </span>
                              )}
                            </td>
                          );

                        case 'thaoTac':
                          return (
                            <td key={colKey} className="text-center">
                              <div style={styles.actionButtonGroup}>
                                <button
                                  type="button"
                                  onClick={() => showModal(item)}
                                  style={styles.actionBtnEdit}
                                  title="Chỉnh sửa thông tin nhà cung cấp"
                                >
                                  <EditOutlined style={{ fontSize: 12 }} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(item.id)}
                                  style={isActive ? styles.actionBtnToggleOff : styles.actionBtnToggleOn}
                                  title={isActive ? 'Bấm để chuyển sang Ngừng hợp tác' : 'Bấm để kích hoạt lại hoạt động'}
                                >
                                  <RetweetOutlined style={{ fontSize: 12 }} />
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
            Tổng số bản ghi: <strong>{total}</strong> nhà cung cấp
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

      {/* ── MODAL THÊM / SỬA NHÀ CUNG CẤP ──────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShopOutlined style={{ color: '#2563eb', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              {editingItem ? `Chỉnh sửa nhà cung cấp: ${editingItem.ma}` : 'Thêm mới nhà cung cấp'}
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleSave}
        confirmLoading={modalLoading}
        onCancel={() => setIsModalVisible(false)}
        width={620}
        okText="Lưu lại"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#2563eb' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <Form.Item
              name="ma"
              label={<span style={{ fontWeight: 600, fontSize: 12 }}>Mã NCC</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mã nhà cung cấp' }]}
            >
              <Input placeholder="VD: NCC-DUOC-01" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="ten"
              label={<span style={{ fontWeight: 600, fontSize: 12 }}>Tên nhà cung cấp</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
            >
              <Input placeholder="VD: Công ty Dược phẩm TW1" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="dienThoai"
              label={<span style={{ fontWeight: 600, fontSize: 12 }}>Số điện thoại</span>}
            >
              <Input placeholder="VD: 024.3825.xxxx" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, fontSize: 12 }}>Email liên hệ</span>}
            >
              <Input type="email" placeholder="VD: contact@duoc.vn" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="maSoThue"
              label={<span style={{ fontWeight: 600, fontSize: 12 }}>Mã số thuế (MST)</span>}
              className="col-span-2"
            >
              <Input placeholder="VD: 0100108999" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="diaChi"
              label={<span style={{ fontWeight: 600, fontSize: 12 }}>Địa chỉ trụ sở / kho hàng</span>}
              className="col-span-2"
            >
              <Input.TextArea rows={3} placeholder="VD: 160 Tôn Đức Thắng, Đống Đa, Hà Nội" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// ── BẢNG STYLES TIÊU CHUẨN ĐỒNG BỘ ───────────────────────────────────────────
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
  actionButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionBtnEdit: {
    padding: '3px 7px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 12,
    color: '#2563eb',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnToggleOn: {
    padding: '3px 7px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 4,
    fontSize: 12,
    color: '#059669',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnToggleOff: {
    padding: '3px 7px',
    backgroundColor: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: 4,
    fontSize: 12,
    color: '#e11d48',
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
