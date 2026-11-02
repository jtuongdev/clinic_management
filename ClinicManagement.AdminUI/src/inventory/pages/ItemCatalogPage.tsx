import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { App, Modal } from 'antd';
import {
  MedicineBoxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  PoweroffOutlined,
  HolderOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { inventoryApi } from '../api/inventory.api';
import { ItemDto, CreateItemRequest } from '../types/inventory.types';
import ItemFormModal from '../components/ItemFormModal';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type ItemColKey =
  | 'stt'
  | 'code'
  | 'name'
  | 'itemType'
  | 'dosageForm'
  | 'strength'
  | 'baseUnit'
  | 'salePrice'
  | 'minimumStock'
  | 'isActive'
  | 'thaoTac';

interface ItemColumnDef {
  key: ItemColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: ItemColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'code', label: 'MÃ DƯỢC / VT', align: 'left' },
  { key: 'name', label: 'TÊN THUỐC / VẬT TƯ', align: 'left' },
  { key: 'itemType', label: 'PHÂN LOẠI', align: 'center' },
  { key: 'dosageForm', label: 'DẠNG BÀO CHẾ', align: 'left' },
  { key: 'strength', label: 'HÀM LƯỢNG', align: 'left' },
  { key: 'baseUnit', label: 'ĐVT', align: 'center' },
  { key: 'salePrice', label: 'GIÁ BÁN LẺ', align: 'right' },
  { key: 'minimumStock', label: 'TỒN TỐI THIỂU', align: 'right' },
  { key: 'isActive', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: ItemColKey[] = [
  'stt',
  'code',
  'name',
  'itemType',
  'dosageForm',
  'strength',
  'baseUnit',
  'salePrice',
  'minimumStock',
  'isActive',
  'thaoTac',
];

const formatCurrencyVND = (value: number): string =>
  (value ?? 0).toLocaleString('vi-VN') + ' đ';

const ItemCatalogPage: React.FC = () => {
  const { message } = App.useApp();

  // ── State dữ liệu ──────────────────────────────────────────────────────────
  const [items, setItems] = useState<ItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ── State phân trang & lọc ─────────────────────────────────────────────────
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [itemType, setItemType] = useState<string | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  // ── State modal ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    code: 120,
    name: 270,
    itemType: 105,
    dosageForm: 130,
    strength: 120,
    baseUnit: 80,
    salePrice: 125,
    minimumStock: 115,
    isActive: 120,
    thaoTac: 105,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<ItemColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<ItemColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ItemColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: ItemColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: ItemColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: ItemColKey) => {
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

  // ── Fetch dữ liệu danh mục từ API ─────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getItems({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
        itemType: itemType || undefined,
        isActive: isActiveFilter,
      });
      if (res.data.success) {
        setItems(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      } else {
        message.error(res.data.message || 'Không tải được danh mục');
        setItems([]);
        setTotal(0);
      }
    } catch {
      message.error('Lỗi kết nối – vui lòng thử lại');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, itemType, isActiveFilter, message]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const displayedItems = useMemo(() => {
    return items;
  }, [items]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<ItemDto[]>([]);
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setKeyword(searchKeyword);
    setPageIndex(1);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setKeyword('');
    setItemType(undefined);
    setIsActiveFilter(undefined);
    setPageIndex(1);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: ItemDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleToggleStatus = (item: ItemDto) => {
    const nextStatus = item.isActive ? 'ngừng dùng' : 'kích hoạt';
    Modal.confirm({
      title: `Xác nhận ${nextStatus} mặt hàng?`,
      content: `Mặt hàng "${item.name}" sẽ được ${nextStatus}.`,
      okText: 'Xác nhận',
      okType: item.isActive ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await inventoryApi.toggleItemStatus(item.id);
          if (res.data.success) {
            message.success(`Đã ${nextStatus} mặt hàng "${item.name}"`);
            fetchItems();
          } else {
            message.error(res.data.message || 'Thao tác thất bại');
          }
        } catch {
          message.error('Lỗi kết nối – vui lòng thử lại');
        }
      },
    });
  };

  const handleSubmit = async (data: CreateItemRequest) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await inventoryApi.updateItem(editingItem.id, data);
        if (res.data.success) {
          message.success('Cập nhật mặt hàng thành công');
          setModalOpen(false);
          await fetchItems();
        } else {
          message.error(res.data.message || 'Cập nhật thất bại');
        }
      } else {
        const res = await inventoryApi.createItem(data);
        if (res.data.success) {
          message.success('Thêm mặt hàng thành công');
          setModalOpen(false);
          await fetchItems();
        } else {
          message.error(res.data.message || 'Thêm mới thất bại');
        }
      }
    } catch {
      message.error('Lỗi kết nối – vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={styles.pageContainer}>
      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div style={styles.headerBar}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIconBox}>
            <MedicineBoxOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          </div>
          <div>
            <div style={styles.pageTitleWrapper}>
              <h1 style={styles.pageTitle}>Danh mục Thuốc &amp; Vật tư y tế</h1>
              <span style={styles.liveBadge}>DANH MỤC GỐC</span>
            </div>
            <p style={styles.pageSubtitle}>
              Quản lý chuẩn hóa danh mục thuốc, vật tư, dạng bào chế, đơn vị tính, giá bán lẻ và định mức tồn kho
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={fetchItems}
            style={styles.btnSecondary}
            title="Tải lại danh mục"
          >
            <ReloadOutlined style={{ fontSize: 13 }} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            style={styles.btnPrimary}
            title="Thêm mặt hàng mới"
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            <span>Thêm mặt hàng</span>
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

          <select
            value={itemType || ''}
            onChange={(e) => {
              const val = e.target.value;
              setItemType(val === '' ? undefined : val);
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 130 }}
          >
            <option value="">Tất cả loại</option>
            <option value="THUOC">Thuốc</option>
            <option value="VA_TU">Vật tư</option>
          </select>

          <select
            value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
            onChange={(e) => {
              const val = e.target.value;
              setIsActiveFilter(val === '' ? undefined : val === 'true');
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 150 }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang dùng</option>
            <option value="false">Ngừng dùng</option>
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
                    <span>Đang tải danh mục thuốc &amp; vật tư...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <span style={{ fontSize: 24 }}>📭</span>
                    <strong style={{ color: '#475569' }}>Không tìm thấy mặt hàng nào phù hợp</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Đặt lại"
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

                        case 'code':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  fontSize: 11.5,
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleEdit(item)}
                                title={`Bấm để chỉnh sửa mã ${item.code}`}
                              >
                                {item.code}
                              </span>
                            </td>
                          );

                        case 'name':
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
                                title={item.name}
                              >
                                {item.name}
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

                        case 'dosageForm':
                          return (
                            <td
                              key={colKey}
                              className="text-left"
                              style={{ ...styles.cellEllipsis, color: '#475569', fontSize: 11.5 }}
                              title={item.dosageForm || '—'}
                            >
                              {item.dosageForm || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'strength':
                          return (
                            <td
                              key={colKey}
                              className="text-left font-mono"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={item.strength || '—'}
                            >
                              {item.strength || <span style={{ color: '#94a3b8' }}>—</span>}
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

                        case 'salePrice':
                          return (
                            <td
                              key={colKey}
                              className="text-right font-mono tabular-nums"
                              style={{ ...styles.cellEllipsis, color: '#0b4f6c', fontWeight: 700, fontSize: 11.5 }}
                              title={formatCurrencyVND(item.salePrice)}
                            >
                              {formatCurrencyVND(item.salePrice)}
                            </td>
                          );

                        case 'minimumStock':
                          return (
                            <td
                              key={colKey}
                              className="text-right font-mono tabular-nums"
                              style={{ ...styles.cellEllipsis, color: '#475569', fontSize: 11.5 }}
                              title={(item.minimumStock ?? 0).toLocaleString('vi-VN')}
                            >
                              {(item.minimumStock ?? 0).toLocaleString('vi-VN')}
                            </td>
                          );

                        case 'isActive':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              {item.isActive ? (
                                <span className="excel-badge success" title="Mặt hàng đang được sử dụng bình thường">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }} />
                                  Đang dùng
                                </span>
                              ) : (
                                <span className="excel-badge danger" title="Mặt hàng đã ngừng hoạt động">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#ef4444' }} />
                                  Ngừng dùng
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
                                  onClick={() => handleEdit(item)}
                                  style={styles.actionBtnEdit}
                                  title="Chỉnh sửa thông tin mặt hàng"
                                >
                                  <EditOutlined style={{ fontSize: 12 }} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(item)}
                                  style={item.isActive ? styles.actionBtnToggleOff : styles.actionBtnToggleOn}
                                  title={item.isActive ? 'Ngừng dùng mặt hàng' : 'Kích hoạt lại mặt hàng'}
                                >
                                  <PoweroffOutlined style={{ fontSize: 12 }} />
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

      {/* Modal thêm / sửa mặt hàng */}
      <ItemFormModal
        open={modalOpen}
        editingItem={editingItem}
        loading={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ItemCatalogPage;

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
