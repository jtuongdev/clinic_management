import { useState, useMemo, useEffect } from 'react';
import { Button, Form, Input, Modal, Select, Space, Tag } from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  HolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useExcelGridResizer } from '../../../shared/hooks/useExcelGridResizer';
import '../../../styles/excel-grid.css';

const leaveTypes = [
  { value: 'PHEP_NAM', label: 'Phép năm' },
  { value: 'PHEP_BENH', label: 'Phép bệnh' },
  { value: 'PHEP_RIENG', label: 'Phép riêng' },
  { value: 'KHONG_LUONG', label: 'Không lương' },
];

const ALL_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'tenNhanVien', label: 'NHÂN VIÊN', align: 'left' },
  { key: 'thoiGian', label: 'THỜI GIAN NGHỈ', align: 'center' },
  { key: 'loaiNghi', label: 'LOẠI NGHỈ', align: 'center' },
  { key: 'lyDo', label: 'LÝ DO', align: 'left' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER = [
  'stt',
  'tenNhanVien',
  'thoiGian',
  'loaiNghi',
  'lyDo',
  'trangThai',
  'thaoTac',
];

export const LeaveManagement = ({
  employees = [],
  leaves = [],
  createLeave,
  reviewLeave,
  cancelLeave,
  statusLabels = {},
}) => {
  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [form] = Form.useForm();

  // Resizer hook
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    tenNhanVien: 200,
    thoiGian: 200,
    loaiNghi: 130,
    lyDo: 240,
    trangThai: 120,
    thaoTac: 160,
  });

  // Reorder columns
  const [colOrder, setColOrder] = useState(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleColDragStart = (e, colKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e, colKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e, targetCol) => {
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

  const submit = async (values) => {
    await createLeave(values);
    setOpen(false);
    form.resetFields();
  };

  // TDZ-safe: displayedLeaves before orderedLeaves
  const displayedLeaves = useMemo(() => {
    let list = leaves || [];
    if (statusFilter) {
      list = list.filter((item) => item.trangThai === statusFilter);
    }
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.tenNhanVien?.toLowerCase().includes(q) ||
          item.lyDo?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leaves, statusFilter, searchKeyword]);

  // Row reordering
  const [orderedLeaves, setOrderedLeaves] = useState([]);
  const [draggedRowId, setDraggedRowId] = useState(null);

  useEffect(() => {
    setOrderedLeaves(displayedLeaves);
  }, [displayedLeaves]);

  const handleRowDragStart = (e, id) => {
    setDraggedRowId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e) => {
    e.preventDefault();
  };

  const handleRowDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetId) {
      setDraggedRowId(null);
      return;
    }
    const current = [...orderedLeaves];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedLeaves(current);
    }
    setDraggedRowId(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(keywordInput);
    setPageIndex(1);
  };

  const renderCellContent = (colKey, row, index) => {
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

      case 'tenNhanVien':
        return (
          <span
            style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={row.tenNhanVien}
          >
            {row.tenNhanVien}
          </span>
        );

      case 'thoiGian':
        return (
          <span style={{ color: '#334155', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {dayjs(row.tuNgay).format('DD/MM/YYYY')} — {dayjs(row.denNgay).format('DD/MM/YYYY')}
          </span>
        );

      case 'loaiNghi':
        return (
          <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>
            {leaveTypes.find((item) => item.value === row.loaiNghi)?.label || row.loaiNghi}
          </Tag>
        );

      case 'lyDo':
        return (
          <span
            style={{ color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={row.lyDo}
          >
            {row.lyDo || '--'}
          </span>
        );

      case 'trangThai':
        return (
          <Tag
            color={
              row.trangThai === 'DA_DUYET'
                ? 'green'
                : row.trangThai === 'TU_CHOI'
                ? 'red'
                : row.trangThai === 'HUY'
                ? 'default'
                : 'gold'
            }
            style={{ margin: 0, fontSize: 11 }}
          >
            {statusLabels[row.trangThai] || row.trangThai}
          </Tag>
        );

      case 'thaoTac':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {row.trangThai === 'CHO_DUYET' && (
              <>
                <Button
                  size="small"
                  type="primary"
                  style={{ background: '#10b981', borderColor: '#10b981', fontSize: 11, height: 24, padding: '0 8px' }}
                  onClick={() => reviewLeave(row.id, true)}
                >
                  Duyệt
                </Button>
                <Button
                  size="small"
                  danger
                  style={{ fontSize: 11, height: 24, padding: '0 8px' }}
                  onClick={() => reviewLeave(row.id, false)}
                >
                  Từ chối
                </Button>
                <Button
                  size="small"
                  style={{ fontSize: 11, height: 24, padding: '0 8px' }}
                  onClick={() => cancelLeave(row.id)}
                >
                  Hủy
                </Button>
              </>
            )}
            {row.trangThai !== 'CHO_DUYET' && (
              <span style={{ color: '#94a3b8', fontSize: 11 }}>Đã xử lý</span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const totalRecords = displayedLeaves.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedLeaves = orderedLeaves.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const startItemIdx = totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItemIdx = Math.min(pageIndex * pageSize, totalRecords);

  return (
    <div className="schedule-leave-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* ── HIGH DENSITY TOOLBAR ────────────────────────────────────────────── */}
      <div
        style={{
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
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          {/* Search box with clear ✕ button */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 5,
                padding: '0 8px',
                height: 30,
                gap: 6,
                width: 220,
              }}
            >
              <SearchOutlined style={{ fontSize: 13, color: '#94a3b8' }} />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Tìm tên nhân viên, lý do..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12,
                  color: '#0f172a',
                  width: '100%',
                }}
              />
              {keywordInput && (
                <button
                  type="button"
                  onClick={() => {
                    setKeywordInput('');
                    setSearchKeyword('');
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Xoá tìm kiếm"
                >
                  <CloseOutlined style={{ fontSize: 10 }} />
                </button>
              )}
            </div>
            <button
              type="submit"
              style={{
                height: 30,
                padding: '0 10px',
                borderRadius: 5,
                border: 'none',
                background: '#0b4f6c',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
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
            style={{
              height: 30,
              borderRadius: 5,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              color: '#334155',
              padding: '0 8px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="CHO_DUYET">Chờ duyệt</option>
            <option value="DA_DUYET">Đã duyệt</option>
            <option value="TU_CHOI">Từ chối</option>
            <option value="HUY">Đã hủy</option>
          </select>

          {/* Reset button */}
          {(searchKeyword || keywordInput || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword('');
                setKeywordInput('');
                setStatusFilter('');
                setPageIndex(1);
              }}
              style={{
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
              }}
              title="Khôi phục bộ lọc"
            >
              <CloseOutlined style={{ fontSize: 10 }} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              color: '#475569',
              background: '#f1f5f9',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
            }}
          >
            Tổng: <strong>{totalRecords}</strong> đơn nghỉ
          </span>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
            style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 6, height: 30, fontSize: 12 }}
          >
            Tạo đơn nghỉ
          </Button>
        </div>
      </div>

      {/* ── EXCEL DATA GRID CONTAINER (RESIZE, REORDER) ───────────────────────── */}
      <div
        className="w-full flex-1 min-h-0 bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto overflow-y-auto excel-grid-container"
        style={{ margin: 0 }}
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
            {paginatedLeaves.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>Chưa có đơn nghỉ nào phù hợp.</span>
                </td>
              </tr>
            ) : (
              paginatedLeaves.map((row, index) => {
                const isRowDragging = draggedRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="h-9 hover:bg-slate-50 transition-colors"
                    style={{
                      opacity: isRowDragging ? 0.35 : 1,
                      backgroundColor: isRowDragging ? '#f1f5f9' : undefined,
                    }}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, row.id)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, row.id)}
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
                          {renderCellContent(colKey, row, index)}
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
      <div
        style={{
          height: 40,
          minHeight: 40,
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          marginTop: 8,
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Hiển thị <strong>{startItemIdx}</strong> - <strong>{endItemIdx}</strong> /{' '}
            <strong>{totalRecords}</strong> đơn nghỉ
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Cỡ trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
              style={{
                height: 26,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                padding: '0 6px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={10}>10 dòng</option>
              <option value={15}>15 dòng</option>
              <option value={30}>30 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              style={{
                height: 26,
                padding: '0 8px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                cursor: pageIndex <= 1 ? 'not-allowed' : 'pointer',
                opacity: pageIndex <= 1 ? 0.4 : 1,
              }}
              title="Trang trước"
            >
              ‹ Trước
            </button>

            <span style={{ fontSize: 12, color: '#475569' }}>
              Trang <strong>{pageIndex}</strong> / <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              style={{
                height: 26,
                padding: '0 8px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                cursor: pageIndex >= totalPages ? 'not-allowed' : 'pointer',
                opacity: pageIndex >= totalPages ? 0.4 : 1,
              }}
              title="Trang sau"
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

      <Modal title="Tạo đơn nghỉ phép" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="maNhanVien" label="Nhân viên" rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={employees.map((item) => ({
                value: item.id,
                label: `${item.hoTen} (${item.maNhanVien || item.username || ''})${item.chucVu ? ` - ${item.chucVu}` : ''}`,
              }))}
            />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true }]} style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="denNgay" label="Đến ngày" rules={[{ required: true }]} style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="loaiNghi" label="Loại nghỉ" rules={[{ required: true }]}>
            <Select options={leaveTypes} />
          </Form.Item>
          <Form.Item name="lyDo" label="Lý do" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}>
            Tạo đơn
          </Button>
        </Form>
      </Modal>
    </div>
  );
};
