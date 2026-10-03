import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  App,
} from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  StopOutlined,
  HolderOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useExamination } from '../hook/useExamination';
import ActionBar from '../../shared/components/layouts/components/ActionBar';
import { LuotKhamItemDto } from '../type/examination.types';
import { examinationApi } from '../api/examination.api';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type ExamColKey =
  | 'stt'
  | 'maBenhNhanNoiBo'
  | 'tenBenhNhan'
  | 'tenKhoa'
  | 'tenBacSi'
  | 'tenPhongKham'
  | 'thoiGianBatDauKham'
  | 'trangThai'
  | 'thaoTac';

interface ExamColumnDef {
  key: ExamColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: ExamColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'maBenhNhanNoiBo', label: 'MÃ BN', align: 'left' },
  { key: 'tenBenhNhan', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'tenKhoa', label: 'KHOA', align: 'left' },
  { key: 'tenBacSi', label: 'BÁC SĨ PHỤ TRÁCH', align: 'left' },
  { key: 'tenPhongKham', label: 'PHÒNG KHÁM', align: 'center' },
  { key: 'thoiGianBatDauKham', label: 'BẮT ĐẦU', align: 'center' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: ExamColKey[] = [
  'stt',
  'maBenhNhanNoiBo',
  'tenBenhNhan',
  'tenKhoa',
  'tenBacSi',
  'tenPhongKham',
  'thoiGianBatDauKham',
  'trangThai',
  'thaoTac',
];

const ExaminationList: React.FC = () => {
  const { message } = App.useApp();
  const {
    luotKhamList,
    luotKhamTotal,
    thongKeKhamBenh,
    loadingLuotKham,
    fetchLuotKhamList,
    fetchThongKeKhamBenh,
    filters,
    khoas,
  } = useExamination();

  // ── State bộ lọc cục bộ ───────────────────────────────────────────────────
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── State ActionBar ───────────────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState<LuotKhamItemDto | null>(null);

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    maBenhNhanNoiBo: 120,
    tenBenhNhan: 230,
    tenKhoa: 150,
    tenBacSi: 165,
    tenPhongKham: 120,
    thoiGianBatDauKham: 110,
    trangThai: 135,
    thaoTac: 130,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<ExamColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<ExamColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ExamColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: ExamColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: ExamColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: ExamColKey) => {
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

  // ── Tải danh sách lượt khám ───────────────────────────────────────────────
  const loadList = useCallback(() => {
    fetchLuotKhamList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter || filters.maKhoa,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, statusFilter, filters.maKhoa, fetchLuotKhamList]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Tải thống kê
  useEffect(() => {
    if (filters.maCoSo) {
      fetchThongKeKhamBenh({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
    }
  }, [filters.maCoSo, filters.maKhoa, fetchThongKeKhamBenh]);

  const displayedItems = useMemo(() => {
    if (!searchKeyword.trim()) return luotKhamList;
    const kw = searchKeyword.trim().toLowerCase();
    return luotKhamList.filter(
      (item) =>
        item.maBenhNhanNoiBo?.toLowerCase().includes(kw) ||
        item.tenBenhNhan?.toLowerCase().includes(kw) ||
        item.tenBacSi?.toLowerCase().includes(kw) ||
        item.tenKhoa?.toLowerCase().includes(kw) ||
        item.tenPhongKham?.toLowerCase().includes(kw)
    );
  }, [luotKhamList, searchKeyword]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<LuotKhamItemDto[]>([]);
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

  const handleRowClick = (item: LuotKhamItemDto) => {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  const closeActionBar = () => {
    setSelectedItem(null);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchKeyword(keywordInput.trim());
    setPageIndex(1);
  };

  const handleResetFilters = () => {
    setKeywordInput('');
    setSearchKeyword('');
    setStatusFilter('');
    setKhoaFilter(undefined);
    setPageIndex(1);
  };

  // ── Business Actions ──────────────────────────────────────────────────────
  const handleViewDetail = (item: LuotKhamItemDto) => {
    Modal.info({
      title: 'Chi tiết lượt khám',
      content: (
        <div style={{ marginTop: 12, lineHeight: 1.8 }}>
          <div><strong>Mã BN:</strong> {item.maBenhNhanNoiBo}</div>
          <div><strong>Họ và tên:</strong> {item.tenBenhNhan}</div>
          <div><strong>Khoa:</strong> {item.tenKhoa || '—'}</div>
          <div><strong>Phòng:</strong> {item.tenPhongKham || '—'}</div>
          <div><strong>Bác sĩ:</strong> {item.tenBacSi || '—'}</div>
          <div><strong>Trạng thái:</strong> {item.trangThai}</div>
          {item.chanDoanSoBo && <div><strong>Chẩn đoán sơ bộ:</strong> {item.chanDoanSoBo}</div>}
        </div>
      ),
      okText: 'Đóng',
    });
  };

  const handleStartExam = async (item: LuotKhamItemDto) => {
    try {
      const res = await examinationApi.batDauKham(item.id);
      if (res.data.success) {
        message.success(`Đã chuyển trạng thái Đang khám: ${item.tenBenhNhan}`);
        loadList();
        closeActionBar();
      } else {
        message.error(res.data.message || 'Không thể bắt đầu khám');
      }
    } catch {
      message.error('Lỗi khi bắt đầu khám');
    }
  };

  const handleCompleteExam = async (item: LuotKhamItemDto) => {
    try {
      const res = await examinationApi.hoanThanhKham(item.id, {});
      if (res.data.success) {
        message.success(`Hoàn tất lượt khám cho ${item.tenBenhNhan}`);
        loadList();
        closeActionBar();
      } else {
        message.error(res.data.message || 'Không thể hoàn tất lượt khám');
      }
    } catch {
      message.error('Lỗi khi hoàn tất lượt khám');
    }
  };

  const handleCancelExam = (item: LuotKhamItemDto) => {
    Modal.confirm({
      title: 'Xác nhận hủy lượt khám?',
      content: `Bạn có chắc muốn hủy lượt khám của bệnh nhân ${item.tenBenhNhan}?`,
      okText: 'Hủy lượt',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: () => {
        message.info(`Đã hủy lượt khám ${item.maBenhNhanNoiBo}`);
        closeActionBar();
      },
    });
  };

  // KPIs
  const kpis = useMemo(() => {
    const cho = thongKeKhamBenh?.cho ?? 0;
    const dangKham = thongKeKhamBenh?.dangKham ?? 0;
    const choCLS = thongKeKhamBenh?.choCLS ?? 0;
    const hoanThanh = thongKeKhamBenh?.hoanThanh ?? 0;
    const total = cho + dangKham + choCLS + hoanThanh;

    return [
      {
        title: 'Tổng lượt',
        value: total,
        color: '#0b4f6c',
        icon: <MedicineBoxOutlined style={{ fontSize: 16, color: '#0b4f6c' }} />,
        statusFilter: '',
      },
      {
        title: 'Chờ khám',
        value: cho,
        color: '#f59e0b',
        icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} />,
        statusFilter: 'Cho',
      },
      {
        title: 'Đang khám',
        value: dangKham,
        color: '#0284c7',
        icon: <MedicineBoxOutlined style={{ fontSize: 16, color: '#0284c7' }} />,
        statusFilter: 'DangKham',
      },
      {
        title: 'Chờ kết quả CLS',
        value: choCLS,
        color: '#8b5cf6',
        icon: <ExperimentOutlined style={{ fontSize: 16, color: '#8b5cf6' }} />,
        statusFilter: 'ChoCLS',
      },
      {
        title: 'Đã hoàn tất',
        value: hoanThanh,
        color: '#10b981',
        icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#10b981' }} />,
        statusFilter: 'HoanThanh',
      },
    ];
  }, [thongKeKhamBenh]);

  const examActions = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary' as const,
      onClick: () => {
        if (selectedItem) handleViewDetail(selectedItem);
      },
    },
    {
      label: 'Bắt đầu khám',
      icon: 'play',
      color: 'success' as const,
      onClick: () => {
        if (selectedItem) handleStartExam(selectedItem);
      },
    },
    {
      label: 'Hoàn tất & lập HĐ',
      icon: 'check',
      color: 'primary' as const,
      onClick: () => {
        if (selectedItem) handleCompleteExam(selectedItem);
      },
    },
    {
      label: 'Hủy lượt',
      icon: 'ban',
      color: 'danger' as const,
      onClick: () => {
        if (selectedItem) handleCancelExam(selectedItem);
      },
    },
  ];

  const totalPages = Math.max(1, Math.ceil(luotKhamTotal / pageSize));

  return (
    <div style={styles.pageContainer}>
      {/* ── METRIC RIBBON / STAT STRIP ──────────────────────────────────────── */}
      {!isFullscreen && (
        <div style={styles.metricsBar}>
          {kpis.map((kpi, idx) => {
            const isSelected = statusFilter === kpi.statusFilter && kpi.statusFilter !== '';
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <div style={styles.metricDivider} />}
                <div
                  style={{
                    ...styles.metricItem,
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setStatusFilter(kpi.statusFilter);
                    setPageIndex(1);
                  }}
                  title={`Lọc lượt khám: ${kpi.title}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{kpi.icon}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.title}:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>
                    {kpi.value}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── CONTROL TOOLBAR ─────────────────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <form onSubmit={handleSearchSubmit} style={styles.toolbarLeft}>
          <div style={styles.searchBox}>
            <SearchOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
            <input
              type="text"
              placeholder="Tìm theo mã BN, tên, BS, phòng..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              style={styles.searchInput}
            />
            {keywordInput && (
              <button
                type="button"
                onClick={() => {
                  setKeywordInput('');
                  setSearchKeyword('');
                  setPageIndex(1);
                }}
                style={styles.clearSearchBtn}
              >
                <CloseOutlined style={{ fontSize: 10 }} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 150 }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Cho">Chờ khám</option>
            <option value="DangKham">Đang khám</option>
            <option value="ChoCLS">Chờ kết quả CLS</option>
            <option value="HoanThanh">Đã hoàn tất</option>
          </select>

          <select
            value={khoaFilter || ''}
            onChange={(e) => {
              const val = e.target.value;
              setKhoaFilter(val ? Number(val) : undefined);
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 165 }}
          >
            <option value="">Tất cả khoa</option>
            {khoas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ten}
              </option>
            ))}
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

          <button
            type="button"
            onClick={loadList}
            style={styles.btnSecondary}
            title="Tải lại danh sách"
          >
            <ReloadOutlined style={{ fontSize: 12 }} />
            <span>Làm mới</span>
          </button>
        </form>

        <div style={styles.toolbarRight}>
          <span style={styles.summaryBadge}>
            Tổng: <strong>{luotKhamTotal}</strong> lượt khám
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
            {loadingLuotKham ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.loadingCell}>
                  <div style={styles.loadingWrapper}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang nạp danh sách lượt khám bệnh...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <MedicineBoxOutlined style={{ fontSize: 24, color: '#94a3b8' }} />
                    <strong style={{ color: '#475569' }}>Không tìm thấy lượt khám nào</strong>
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
                const isSelected = selectedItem?.id === item.id;

                return (
                  <tr
                    key={item.id || index}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, index)}
                    onDragOver={(e) => handleRowDragOver(e, index)}
                    onDrop={(e) => handleRowDrop(e, index)}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-blue-50/60 even:bg-slate-50/30"
                    style={{
                      transition: 'background-color 0.12s ease',
                      opacity: isDraggingRow ? 0.35 : 1,
                      borderTop: isDragOverRow ? '2px dashed #2563eb' : undefined,
                      backgroundColor: isSelected ? '#eff6ff' : undefined,
                      cursor: 'pointer',
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

                        case 'maBenhNhanNoiBo':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  fontSize: 11.5,
                                }}
                                title={item.maBenhNhanNoiBo}
                              >
                                {item.maBenhNhanNoiBo}
                              </span>
                            </td>
                          );

                        case 'tenBenhNhan':
                          return (
                            <td key={colKey} className="text-left" style={styles.cellEllipsis}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    fontSize: 12,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={item.tenBenhNhan}
                                >
                                  {item.tenBenhNhan}
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>
                                  ({item.tuoi}t · {item.gioiTinh === 'M' ? 'Nam' : 'Nữ'})
                                </span>
                              </div>
                            </td>
                          );

                        case 'tenKhoa':
                          return (
                            <td
                              key={colKey}
                              className="text-left"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={item.tenKhoa || '—'}
                            >
                              {item.tenKhoa || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'tenBacSi':
                          return (
                            <td
                              key={colKey}
                              className="text-left"
                              style={{ ...styles.cellEllipsis, color: '#0f172a', fontWeight: 500, fontSize: 11.5 }}
                              title={item.tenBacSi || '—'}
                            >
                              {item.tenBacSi || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'tenPhongKham':
                          return (
                            <td key={colKey} className="text-center font-mono" style={styles.cellEllipsis}>
                              {item.tenPhongKham ? (
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
                                >
                                  {item.tenPhongKham}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                          );

                        case 'thoiGianBatDauKham':
                          return (
                            <td
                              key={colKey}
                              className="text-center font-mono"
                              style={{ ...styles.cellEllipsis, color: '#475569', fontSize: 11.5 }}
                              title={
                                item.thoiGianBatDauKham
                                  ? new Date(item.thoiGianBatDauKham).toLocaleString('vi-VN')
                                  : '—'
                              }
                            >
                              {item.thoiGianBatDauKham
                                ? new Date(item.thoiGianBatDauKham).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </td>
                          );

                        case 'trangThai':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              {item.trangThai === 'Cho' || item.trangThai === 'CHO_KHAM' ? (
                                <span className="excel-badge warning">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#f59e0b' }} />
                                  Chờ khám
                                </span>
                              ) : item.trangThai === 'DangKham' || item.trangThai === 'DANG_KHAM' ? (
                                <span className="excel-badge info">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#0284c7' }} />
                                  Đang khám
                                </span>
                              ) : item.trangThai === 'ChoCLS' || item.trangThai === 'CHO_CLS' ? (
                                <span
                                  className="excel-badge"
                                  style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}
                                >
                                  <span style={{ ...styles.statusDot, backgroundColor: '#7c3aed' }} />
                                  Chờ CLS
                                </span>
                              ) : item.trangThai === 'HoanThanh' || item.trangThai === 'HOAN_THANH' ? (
                                <span className="excel-badge success">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }} />
                                  Hoàn tất
                                </span>
                              ) : (
                                <span className="excel-badge">{item.trangThai || 'Chờ'}</span>
                              )}
                            </td>
                          );

                        case 'thaoTac':
                          return (
                            <td key={colKey} className="text-center" onClick={(e) => e.stopPropagation()}>
                              <div style={styles.actionButtonGroup}>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetail(item)}
                                  style={styles.actionBtnView}
                                  title="Xem chi tiết lượt khám"
                                >
                                  <EyeOutlined style={{ fontSize: 11 }} />
                                </button>
                                {item.trangThai === 'Cho' || item.trangThai === 'CHO_KHAM' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleStartExam(item)}
                                    style={styles.actionBtnStart}
                                    title="Bắt đầu khám"
                                  >
                                    <PlayCircleOutlined style={{ fontSize: 11 }} />
                                  </button>
                                ) : null}
                                {item.trangThai === 'DangKham' || item.trangThai === 'DANG_KHAM' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCompleteExam(item)}
                                    style={styles.actionBtnComplete}
                                    title="Hoàn tất khám & Lập hóa đơn"
                                  >
                                    <CheckOutlined style={{ fontSize: 11 }} />
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => handleCancelExam(item)}
                                  style={styles.actionBtnCancel}
                                  title="Hủy lượt khám"
                                >
                                  <StopOutlined style={{ fontSize: 11 }} />
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
            Tổng số bản ghi: <strong>{luotKhamTotal}</strong> lượt khám
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
              disabled={pageIndex <= 1 || loadingLuotKham}
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
              disabled={pageIndex >= totalPages || loadingLuotKham}
              onClick={() => setPageIndex((p) => p + 1)}
              style={styles.pageNavBtn}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

      {/* Modernized ActionBar */}
      <ActionBar
        isVisible={!!selectedItem}
        onClose={closeActionBar}
        selectedId={selectedItem?.maBenhNhanNoiBo}
        actions={examActions}
        title="Lượt khám đã chọn"
        entityName={selectedItem?.tenBenhNhan || 'Người bệnh'}
      />
    </div>
  );
};

export default ExaminationList;

// ── STYLES TIÊU CHUẨN ────────────────────────────────────────────────────────
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
  metricsBar: {
    height: 38,
    minHeight: 38,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    overflowX: 'auto',
    flexShrink: 0,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  },
  metricItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    borderRadius: 5,
    transition: 'all 0.12s ease',
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#cbd5e1',
    flexShrink: 0,
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
  actionBtnView: {
    padding: '3px 7px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 11,
    color: '#2563eb',
    cursor: 'pointer',
  },
  actionBtnStart: {
    padding: '3px 7px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 4,
    fontSize: 11,
    color: '#059669',
    cursor: 'pointer',
  },
  actionBtnComplete: {
    padding: '3px 7px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 4,
    fontSize: 11,
    color: '#1d4ed8',
    cursor: 'pointer',
  },
  actionBtnCancel: {
    padding: '3px 7px',
    backgroundColor: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: 4,
    fontSize: 11,
    color: '#e11d48',
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
};