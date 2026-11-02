import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  App,
} from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  SearchOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  HolderOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useExamination } from '../hook/useExamination';
import ActionBar from '../../shared/components/layouts/components/ActionBar';
import { BenhNhanListDto } from '../type/examination.types';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type PatientColKey =
  | 'stt'
  | 'maBenhNhanNoiBo'
  | 'hoTen'
  | 'dienThoai'
  | 'maLuotKhamGanNhat'
  | 'khoa'
  | 'bacSi'
  | 'thoiGianBatDauKham'
  | 'trangThaiLuotKham'
  | 'thaoTac';

interface PatientColumnDef {
  key: PatientColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: PatientColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'maBenhNhanNoiBo', label: 'MÃ BN', align: 'left' },
  { key: 'hoTen', label: 'HỌ VÀ TÊN', align: 'left' },
  { key: 'dienThoai', label: 'ĐIỆN THOẠI', align: 'left' },
  { key: 'maLuotKhamGanNhat', label: 'LƯỢT KHÁM GẦN NHẤT', align: 'left' },
  { key: 'khoa', label: 'KHOA', align: 'left' },
  { key: 'bacSi', label: 'BÁC SĨ PHỤ TRÁCH', align: 'left' },
  { key: 'thoiGianBatDauKham', label: 'BẮT ĐẦU KHÁM', align: 'center' },
  { key: 'trangThaiLuotKham', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: PatientColKey[] = [
  'stt',
  'maBenhNhanNoiBo',
  'hoTen',
  'dienThoai',
  'maLuotKhamGanNhat',
  'khoa',
  'bacSi',
  'thoiGianBatDauKham',
  'trangThaiLuotKham',
  'thaoTac',
];

const ExaminationPatients: React.FC = () => {
  const { message } = App.useApp();
  const {
    benhNhanList,
    thongKeBenhNhan,
    benhNhanTotal,
    loadingBenhNhan,
    fetchBenhNhanList,
    fetchThongKeBenhNhan,
    filters,
    khoas,
  } = useExamination();

  // ── State bộ lọc và phân trang ──────────────────────────────────────────────
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedKhoa, setSelectedKhoa] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── State ActionBar / Row selection ─────────────────────────────────────────
  const [selectedPatient, setSelectedPatient] = useState<BenhNhanListDto | null>(null);

  // ── Hook resize cột Excel Grid ────────────────────────────────────────────
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    maBenhNhanNoiBo: 120,
    hoTen: 230,
    dienThoai: 125,
    maLuotKhamGanNhat: 155,
    khoa: 150,
    bacSi: 160,
    thoiGianBatDauKham: 130,
    trangThaiLuotKham: 135,
    thaoTac: 110,
  });

  // ── Sắp xếp thứ tự cột (Column Reordering Drag & Drop) ─────────────────────
  const [colOrder, setColOrder] = useState<PatientColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<PatientColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<PatientColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: PatientColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: PatientColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: PatientColKey) => {
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

  // ── Hàm tải dữ liệu ───────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    fetchBenhNhanList({
      pageIndex,
      pageSize,
      keyword: searchKeyword || undefined,
      trangThai: selectedStatus || undefined,
      maKhoa: selectedKhoa || filters.maKhoa || undefined,
      maCoSo: filters.maCoSo || undefined,
    });
    fetchThongKeBenhNhan({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
  }, [
    pageIndex,
    pageSize,
    searchKeyword,
    selectedStatus,
    selectedKhoa,
    filters.maCoSo,
    filters.maKhoa,
    fetchBenhNhanList,
    fetchThongKeBenhNhan,
  ]);

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setPageIndex(1);
  }, [searchKeyword, selectedStatus, selectedKhoa, filters.maCoSo, filters.maKhoa]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedItems = useMemo(() => {
    return benhNhanList;
  }, [benhNhanList]);

  // ── Sắp xếp thứ tự hàng (Row Reordering Drag & Drop) ───────────────────────
  const [orderedItems, setOrderedItems] = useState<BenhNhanListDto[]>([]);
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

  const handleRowClick = (record: BenhNhanListDto) => {
    setSelectedPatient(record);
  };

  const handleCloseActionBar = () => {
    setSelectedPatient(null);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchKeyword(keywordInput.trim());
    setPageIndex(1);
  };

  const handleResetFilters = () => {
    setKeywordInput('');
    setSearchKeyword('');
    setSelectedStatus('');
    setSelectedKhoa(undefined);
    setPageIndex(1);
  };

  // KPIs
  const kpis = useMemo(() => {
    return [
      {
        label: 'Tiếp nhận hôm nay',
        value: thongKeBenhNhan?.homNay ?? 0,
        color: '#0b4f6c',
        icon: <TeamOutlined style={{ fontSize: 16, color: '#0b4f6c' }} />,
        statusFilter: '',
      },
      {
        label: 'Chờ khám',
        value: thongKeBenhNhan?.cho ?? 0,
        color: '#f59e0b',
        icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} />,
        statusFilter: 'Cho',
      },
      {
        label: 'Đang khám',
        value: thongKeBenhNhan?.dangKham ?? 0,
        color: '#0284c7',
        icon: <MedicineBoxOutlined style={{ fontSize: 16, color: '#0284c7' }} />,
        statusFilter: 'DangKham',
      },
      {
        label: 'Đã hoàn tất',
        value: thongKeBenhNhan?.hoanThanh ?? 0,
        color: '#10b981',
        icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#10b981' }} />,
        statusFilter: 'HoanThanh',
      },
    ];
  }, [thongKeBenhNhan]);

  // Actions cho ActionBar
  const patientActions = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary' as const,
      onClick: (id: number | string) => {
        message.info(`Xem chi tiết bệnh nhân: ${id}`);
      },
    },
    {
      label: 'Chỉnh sửa',
      icon: 'edit',
      color: 'warning' as const,
      onClick: (id: number | string) => {
        message.info(`Sửa thông tin bệnh nhân: ${id}`);
      },
    },
    {
      label: 'Xóa hồ sơ',
      icon: 'trash',
      color: 'danger' as const,
      onClick: (id: number | string) => {
        Modal.confirm({
          title: 'Xác nhận xóa hồ sơ bệnh nhân?',
          content: `Bạn có chắc muốn xóa hồ sơ của bệnh nhân ${id}?`,
          okText: 'Xóa',
          okType: 'danger',
          onOk: () => {
            message.success(`Đã xóa bệnh nhân: ${id}`);
            setSelectedPatient(null);
            loadData();
          },
        });
      },
    },
  ];

  const totalPages = Math.max(1, Math.ceil(benhNhanTotal / pageSize));

  return (
    <div style={styles.pageContainer}>
      {/* ── METRIC RIBBON / STAT STRIP ──────────────────────────────────────── */}
      {!isFullscreen && (
        <div style={styles.metricsBar}>
          {kpis.map((kpi, idx) => {
            const isSelected = selectedStatus === kpi.statusFilter && kpi.statusFilter !== '';
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
                    setSelectedStatus(kpi.statusFilter);
                    setPageIndex(1);
                  }}
                  title={`Bấm để lọc người bệnh: ${kpi.label}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{kpi.icon}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
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
              placeholder="Tìm tên, mã BN, SĐT..."
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
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPageIndex(1);
            }}
            style={{ ...styles.filterSelect, minWidth: 150 }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Cho">Chờ khám</option>
            <option value="DangKham">Đang khám</option>
            <option value="HoanThanh">Hoàn tất</option>
          </select>

          <select
            value={selectedKhoa || ''}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedKhoa(val ? Number(val) : undefined);
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
            onClick={loadData}
            style={styles.btnSecondary}
            title="Tải lại danh sách"
          >
            <ReloadOutlined style={{ fontSize: 12 }} />
            <span>Làm mới</span>
          </button>
        </form>

        <div style={styles.toolbarRight}>
          <span style={styles.summaryBadge}>
            Tổng: <strong>{benhNhanTotal}</strong> người bệnh
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
            {loadingBenhNhan ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.loadingCell}>
                  <div style={styles.loadingWrapper}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang nạp danh sách hồ sơ người bệnh...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <TeamOutlined style={{ fontSize: 24, color: '#94a3b8' }} />
                    <strong style={{ color: '#475569' }}>Không tìm thấy hồ sơ người bệnh nào</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Đặt lại" bộ lọc
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const sttNumber = (pageIndex - 1) * pageSize + index + 1;
                const isDraggingRow = draggedRowIndex === index;
                const isDragOverRow = dragOverRowIndex === index;
                const isSelected = selectedPatient?.id === item.id;

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

                        case 'hoTen':
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
                                  title={item.hoTen}
                                >
                                  {item.hoTen}
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>
                                  ({item.tuoi}t · {item.gioiTinh === 'M' ? 'Nam' : 'Nữ'})
                                </span>
                              </div>
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

                        case 'maLuotKhamGanNhat':
                          return (
                            <td key={colKey} className="text-left font-mono" style={styles.cellEllipsis}>
                              {item.maLuotKhamGanNhat ? (
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
                                  {item.maLuotKhamGanNhat}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                          );

                        case 'khoa':
                          return (
                            <td
                              key={colKey}
                              className="text-left"
                              style={{ ...styles.cellEllipsis, color: '#334155', fontSize: 11.5 }}
                              title={item.khoa || '—'}
                            >
                              {item.khoa || <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          );

                        case 'bacSi':
                          return (
                            <td
                              key={colKey}
                              className="text-left"
                              style={{ ...styles.cellEllipsis, color: '#0f172a', fontWeight: 500, fontSize: 11.5 }}
                              title={item.bacSi || '—'}
                            >
                              {item.bacSi || <span style={{ color: '#94a3b8' }}>—</span>}
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

                        case 'trangThaiLuotKham':
                          return (
                            <td key={colKey} className="text-center" style={styles.cellEllipsis}>
                              {item.trangThaiLuotKham === 'Cho' || item.trangThaiLuotKham === 'CHO_KHAM' ? (
                                <span className="excel-badge warning">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#f59e0b' }} />
                                  Chờ khám
                                </span>
                              ) : item.trangThaiLuotKham === 'DangKham' || item.trangThaiLuotKham === 'DANG_KHAM' ? (
                                <span className="excel-badge info">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#0284c7' }} />
                                  Đang khám
                                </span>
                              ) : item.trangThaiLuotKham === 'HoanThanh' || item.trangThaiLuotKham === 'HOAN_THANH' ? (
                                <span className="excel-badge success">
                                  <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }} />
                                  Hoàn tất
                                </span>
                              ) : (
                                <span className="excel-badge">{item.trangThaiLuotKham || 'Chờ'}</span>
                              )}
                            </td>
                          );

                        case 'thaoTac':
                          return (
                            <td key={colKey} className="text-center" onClick={(e) => e.stopPropagation()}>
                              <div style={styles.actionButtonGroup}>
                                <button
                                  type="button"
                                  onClick={() => handleRowClick(item)}
                                  style={styles.actionBtnView}
                                  title="Xem chi tiết người bệnh"
                                >
                                  <EyeOutlined style={{ fontSize: 11 }} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => message.info(`Sửa thông tin ${item.hoTen}`)}
                                  style={styles.actionBtnEdit}
                                  title="Chỉnh sửa hồ sơ"
                                >
                                  <EditOutlined style={{ fontSize: 11 }} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    Modal.confirm({
                                      title: 'Xác nhận xóa hồ sơ?',
                                      content: `Xóa hồ sơ bệnh nhân ${item.hoTen}?`,
                                      okText: 'Xóa',
                                      okType: 'danger',
                                      onOk: () => {
                                        message.success(`Đã xóa ${item.hoTen}`);
                                        loadData();
                                      },
                                    });
                                  }}
                                  style={styles.actionBtnDelete}
                                  title="Xóa hồ sơ"
                                >
                                  <DeleteOutlined style={{ fontSize: 11 }} />
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
            Tổng số bản ghi: <strong>{benhNhanTotal}</strong> người bệnh
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
              disabled={pageIndex <= 1 || loadingBenhNhan}
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
              disabled={pageIndex >= totalPages || loadingBenhNhan}
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
        isVisible={!!selectedPatient}
        onClose={handleCloseActionBar}
        selectedId={selectedPatient?.maBenhNhanNoiBo}
        actions={patientActions}
        title="Bệnh nhân đã chọn"
        entityName={selectedPatient?.hoTen || 'Người bệnh'}
      />
    </div>
  );
};

export default ExaminationPatients;

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
  actionBtnEdit: {
    padding: '3px 7px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 11,
    color: '#f59e0b',
    cursor: 'pointer',
  },
  actionBtnDelete: {
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