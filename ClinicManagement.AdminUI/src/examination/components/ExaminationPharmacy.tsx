import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Tag,
  Modal,
  Alert,
  App,
  Tooltip,
} from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AlertOutlined,
  EyeOutlined,
  CheckOutlined,
  DeleteOutlined,
  ShopOutlined,
  ReloadOutlined,
  SearchOutlined,
  HolderOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useExamination } from '../hook/useExamination';
import ActionBar, { ActionItem } from '../../shared/components/layouts/components/ActionBar';
import { DonThuocListDto } from '../type/prescription.examination.type';
import { examinationApi } from '../api/examination.api';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type PharmacyColKey =
  | 'stt'
  | 'tenBenhNhan'
  | 'tenKhoa'
  | 'tenBacSi'
  | 'soLuongThuoc'
  | 'tongTien'
  | 'ngayKe'
  | 'trangThai'
  | 'thaoTac';

interface PharmacyColumnDef {
  key: PharmacyColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: PharmacyColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'tenBenhNhan', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'tenKhoa', label: 'KHOA', align: 'left' },
  { key: 'tenBacSi', label: 'BÁC SĨ KÊ ĐƠN', align: 'left' },
  { key: 'soLuongThuoc', label: 'SỐ LOẠI', align: 'center' },
  { key: 'tongTien', label: 'TỔNG TIỀN', align: 'right' },
  { key: 'ngayKe', label: 'NGÀY KÊ', align: 'center' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: PharmacyColKey[] = [
  'stt',
  'tenBenhNhan',
  'tenKhoa',
  'tenBacSi',
  'soLuongThuoc',
  'tongTien',
  'ngayKe',
  'trangThai',
  'thaoTac',
];

const ExaminationPharmacy: React.FC = () => {
  const { message } = App.useApp();
  const {
    donThuocList,
    donThuocTotal,
    thongKeDonThuoc,
    loadingDonThuoc,
    fetchDonThuocList,
    fetchThongKeDonThuoc,
    khoas,
    filters,
  } = useExamination();

  // State bộ lọc
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State ActionBar
  const [selectedDonThuoc, setSelectedDonThuoc] = useState<DonThuocListDto | null>(null);
  const [showActionBar, setShowActionBar] = useState(false);

  // Column Resizing hook
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    tenBenhNhan: 200,
    tenKhoa: 140,
    tenBacSi: 160,
    soLuongThuoc: 95,
    tongTien: 130,
    ngayKe: 110,
    trangThai: 130,
    thaoTac: 120,
  });

  // Column Reordering (Drag & Drop)
  const [colOrder, setColOrder] = useState<PharmacyColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<PharmacyColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<PharmacyColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: PharmacyColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: PharmacyColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: PharmacyColKey) => {
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

  // Row Click for ActionBar
  const handleRowClick = (item: DonThuocListDto) => {
    setSelectedDonThuoc(item);
    setShowActionBar(true);
  };

  const handleCloseActionBar = () => {
    setShowActionBar(false);
    setSelectedDonThuoc(null);
  };

  // Refresh data
  const refreshPrescriptions = useCallback(() => {
    fetchDonThuocList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter || filters.maKhoa,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, filters.maKhoa, statusFilter, fetchDonThuocList]);

  useEffect(() => {
    refreshPrescriptions();
  }, [refreshPrescriptions]);

  // Load KPI stats
  useEffect(() => {
    fetchThongKeDonThuoc({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
  }, [filters.maCoSo, filters.maKhoa, fetchThongKeDonThuoc]);

  // Actions
  const handleApprovePrescription = async (id: number | string) => {
    if (!selectedDonThuoc) return;
    Modal.confirm({
      title: 'Xác nhận duyệt đơn thuốc?',
      content: `Duyệt cấp phát cho đơn thuốc #${id}?`,
      okText: 'Duyệt đơn',
      onOk: async () => {
        await examinationApi.approvePrescription(
          Number(selectedDonThuoc.maLuotKham),
          Number(id),
        );
        message.success(`Đã duyệt đơn thuốc #${id}`);
        refreshPrescriptions();
      },
    });
  };

  const handleDispenseMedicine = async (id: number | string) => {
    await examinationApi.dispensePrescription(Number(id), `dispense-${id}-${Date.now()}`);
    message.success(`Đã xuất kho thuốc cho đơn #${id}`);
    refreshPrescriptions();
  };

  const handleCancelPrescription = async (id: number | string) => {
    if (!selectedDonThuoc) return;
    Modal.confirm({
      title: 'Xác nhận hủy đơn thuốc?',
      content: `Bạn có chắc muốn hủy đơn thuốc #${id}?`,
      okText: 'Hủy đơn',
      okType: 'danger',
      onOk: async () => {
        await examinationApi.cancelPrescription(
          Number(selectedDonThuoc.maLuotKham),
          Number(id),
        );
        message.info(`Đã hủy đơn thuốc #${id}`);
        refreshPrescriptions();
      },
    });
  };

  const donThuocActions: ActionItem[] = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary',
      onClick: (id) => {
        message.info(`Xem chi tiết đơn thuốc #${id}`);
      },
    },
    {
      label: 'Duyệt đơn',
      icon: 'check',
      color: 'success',
      onClick: handleApprovePrescription,
    },
    {
      label: 'Xuất thuốc',
      icon: 'truck',
      color: 'info',
      onClick: handleDispenseMedicine,
    },
    {
      label: 'Hủy',
      icon: 'trash',
      color: 'danger',
      onClick: handleCancelPrescription,
    },
  ];

  // KPIs
  const kpis = useMemo(() => {
    return [
      {
        label: 'Tổng đơn thuốc',
        value: thongKeDonThuoc?.tongDonThuoc ?? 0,
        color: '#0b4f6c',
        icon: <MedicineBoxOutlined style={{ fontSize: 16, color: '#0b4f6c' }} />,
      },
      {
        label: 'Đơn tạm',
        value: thongKeDonThuoc?.tam ?? 0,
        color: '#f59e0b',
        icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} />,
      },
      {
        label: 'Đã duyệt',
        value: thongKeDonThuoc?.daDuyet ?? 0,
        color: '#0284c7',
        icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#0284c7' }} />,
      },
      {
        label: 'Đã xuất hết',
        value: thongKeDonThuoc?.daXuatHet ?? 0,
        color: '#10b981',
        icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#10b981' }} />,
      },
      {
        label: 'Đã hủy',
        value: thongKeDonThuoc?.daHuy ?? 0,
        color: '#ef4444',
        icon: <CloseCircleOutlined style={{ fontSize: 16, color: '#ef4444' }} />,
      },
      {
        label: 'Tồn kho cảnh báo',
        value: '2 mặt hàng',
        color: '#8b5cf6',
        icon: <ShopOutlined style={{ fontSize: 16, color: '#8b5cf6' }} />,
      },
    ];
  }, [thongKeDonThuoc]);

  const formatCurrency = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // TDZ-safe: displayedItems declared BEFORE orderedItems
  const displayedItems = useMemo(() => {
    if (!searchKeyword.trim()) return donThuocList;
    const kw = searchKeyword.trim().toLowerCase();
    return donThuocList.filter(
      (item) =>
        item.tenBenhNhan?.toLowerCase().includes(kw) ||
        item.tenBacSi?.toLowerCase().includes(kw) ||
        item.tenKhoa?.toLowerCase().includes(kw)
    );
  }, [donThuocList, searchKeyword]);

  // Row reordering (Drag & Drop)
  const [orderedItems, setOrderedItems] = useState<DonThuocListDto[]>([]);
  const [draggedRowId, setDraggedRowId] = useState<number | null>(null);

  useEffect(() => {
    setOrderedItems(displayedItems);
  }, [displayedItems]);

  const handleRowDragStart = (e: React.DragEvent, id: number) => {
    setDraggedRowId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRowDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetId) {
      setDraggedRowId(null);
      return;
    }
    const current = [...orderedItems];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
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
    setKhoaFilter(undefined);
    setPageIndex(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(keywordInput);
    setPageIndex(1);
  };

  const renderCellContent = (colKey: PharmacyColKey, item: DonThuocListDto, index: number) => {
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

      case 'tenBenhNhan':
        return (
          <span
            title={item.tenBenhNhan}
            style={{
              fontWeight: 700,
              color: '#0b4f6c',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.tenBenhNhan}
          </span>
        );

      case 'tenKhoa':
        return (
          <span
            title={item.tenKhoa}
            style={{
              color: '#334155',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.tenKhoa || '--'}
          </span>
        );

      case 'tenBacSi':
        return (
          <span
            title={item.tenBacSi}
            style={{
              fontWeight: 500,
              color: '#334155',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.tenBacSi || '--'}
          </span>
        );

      case 'soLuongThuoc':
        return (
          <Tag color="blue" style={{ borderRadius: 3, margin: 0, padding: '0 6px', fontSize: 11 }}>
            {item.soLuongThuoc} loại
          </Tag>
        );

      case 'tongTien':
        return (
          <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
            {formatCurrency(item.tongTien)}
          </span>
        );

      case 'ngayKe':
        return (
          <span style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
            {formatDate(item.ngayKe)}
          </span>
        );

      case 'trangThai': {
        switch (item.trangThai) {
          case 'TAM':
            return <Tag color="warning" style={{ margin: 0, fontSize: 11 }}>Tạm</Tag>;
          case 'DA_DUYET':
            return <Tag color="processing" style={{ margin: 0, fontSize: 11 }}>Đã duyệt</Tag>;
          case 'DA_XUAT_HET':
            return <Tag color="success" style={{ margin: 0, fontSize: 11 }}>Đã xuất</Tag>;
          case 'HUY':
            return <Tag color="default" style={{ margin: 0, fontSize: 11 }}>Đã hủy</Tag>;
          default:
            return <Tag color="default" style={{ margin: 0, fontSize: 11 }}>{item.trangThai || 'Tạm'}</Tag>;
        }
      }

      case 'thaoTac':
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Xem chi tiết">
              <button
                type="button"
                onClick={() => handleRowClick(item)}
                style={styles.actionIconButton}
              >
                <EyeOutlined style={{ color: '#0b4f6c' }} />
              </button>
            </Tooltip>
            {item.trangThai === 'TAM' && (
              <Tooltip title="Duyệt đơn thuốc">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDonThuoc(item);
                    handleApprovePrescription(item.id);
                  }}
                  style={{ ...styles.actionIconButton, color: '#10b981' }}
                >
                  <CheckOutlined />
                </button>
              </Tooltip>
            )}
            {item.trangThai === 'DA_DUYET' && (
              <Tooltip title="Xuất thuốc">
                <button
                  type="button"
                  onClick={() => handleDispenseMedicine(item.id)}
                  style={{ ...styles.actionIconButton, color: '#0284c7' }}
                >
                  <ShopOutlined />
                </button>
              </Tooltip>
            )}
            <Tooltip title="Hủy đơn">
              <button
                type="button"
                onClick={() => {
                  setSelectedDonThuoc(item);
                  handleCancelPrescription(item.id);
                }}
                style={{ ...styles.actionIconButton, color: '#ef4444' }}
              >
                <DeleteOutlined />
              </button>
            </Tooltip>
          </div>
        );

      default:
        return null;
    }
  };

  const totalPages = Math.ceil(donThuocTotal / pageSize) || 1;
  const startItemIdx = donThuocTotal === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItemIdx = Math.min(pageIndex * pageSize, donThuocTotal);

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

      {/* ── MAIN BODY: SPLIT WITH RIGHT WARNING PANEL ───────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        {/* Left Pane: Excel Grid */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Integrated Control Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.toolbarLeft}>
              {/* Search input with clear button ✕ */}
              <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
                <div style={styles.searchWrapper}>
                  <SearchOutlined style={{ fontSize: 13, color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Tìm tên bệnh nhân, bác sĩ..."
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

              {/* Filter Trạng thái */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(1);
                }}
                style={styles.selectFilter}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="TAM">Tạm</option>
                <option value="DA_DUYET">Đã duyệt</option>
                <option value="DA_XUAT_HET">Đã xuất</option>
                <option value="HUY">Đã hủy</option>
              </select>

              {/* Filter Khoa */}
              <select
                value={khoaFilter ?? ''}
                onChange={(e) => {
                  setKhoaFilter(e.target.value ? Number(e.target.value) : undefined);
                  setPageIndex(1);
                }}
                style={styles.selectFilter}
              >
                <option value="">Tất cả khoa</option>
                {khoas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ten}
                  </option>
                ))}
              </select>

              {/* Reset filter */}
              {(searchKeyword || keywordInput || statusFilter || khoaFilter !== undefined) && (
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
                onClick={refreshPrescriptions}
                style={styles.btnSecondary}
                title="Làm mới dữ liệu"
              >
                <ReloadOutlined style={{ fontSize: 12 }} />
                <span>Làm mới</span>
              </button>
            </div>

            <div style={styles.toolbarRight}>
              <span style={styles.summaryBadge}>
                Tổng: <strong>{donThuocTotal}</strong> đơn thuốc
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

          {/* ── EXCEL DATA GRID CONTAINER (RESIZE, REORDER) ─────────────────── */}
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
                {loadingDonThuoc ? (
                  <tr>
                    <td colSpan={colOrder.length} style={styles.loadingCell}>
                      <div style={styles.loadingWrapper}>
                        <span style={{ fontSize: 18 }}>⏳</span>
                        <span>Đang nạp danh sách đơn thuốc...</span>
                      </div>
                    </td>
                  </tr>
                ) : orderedItems.length === 0 ? (
                  <tr>
                    <td colSpan={colOrder.length} style={styles.emptyCell}>
                      <div style={styles.emptyWrapper}>
                        <MedicineBoxOutlined style={{ fontSize: 28, color: '#94a3b8' }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                          Không có đơn thuốc nào phù hợp
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orderedItems.map((item, index) => {
                    const isRowDragging = draggedRowId === item.id;
                    const isSelected = selectedDonThuoc?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        className="h-9 hover:bg-slate-50 transition-colors"
                        style={{
                          opacity: isRowDragging ? 0.35 : 1,
                          backgroundColor: isSelected ? '#e0f2fe' : isRowDragging ? '#f1f5f9' : undefined,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleRowClick(item)}
                        draggable
                        onDragStart={(e) => handleRowDragStart(e, item.id)}
                        onDragOver={handleRowDragOver}
                        onDrop={(e) => handleRowDrop(e, item.id)}
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

          {/* ── FOOTER PAGINATION BAR ────────────────────────────────────────── */}
          <div style={styles.footerBar}>
            <div style={styles.footerLeft}>
              <span style={styles.pageInfo}>
                Hiển thị <strong>{startItemIdx}</strong> - <strong>{endItemIdx}</strong> /{' '}
                <strong>{donThuocTotal}</strong> đơn thuốc
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

        {/* Right Pane: Docked Stock Warning Panel */}
        {!isFullscreen && (
          <div
            style={{
              width: 320,
              minWidth: 320,
              borderLeft: '1px solid #e2e8f0',
              background: '#fafbfc',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                height: 44,
                minHeight: 44,
                padding: '0 16px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertOutlined style={{ color: '#ef4444' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Cảnh báo tồn kho dược
                </span>
              </div>
              <Tag color="red" style={{ margin: 0, fontSize: 11 }}>
                2 loại
              </Tag>
            </div>

            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
              <Alert
                type="error"
                showIcon
                message="Paracetamol 500mg"
                description="Còn 20 viên trong kho, dưới ngưỡng an toàn (50 viên)."
              />
              <Alert
                type="warning"
                showIcon
                message="Amoxicillin 250mg"
                description="Lô hàng HSD-2026 sắp hết hạn trong 3 ngày tới."
              />
            </div>
          </div>
        )}
      </div>

      {/* ActionBar */}
      <ActionBar
        isVisible={showActionBar}
        onClose={handleCloseActionBar}
        selectedId={selectedDonThuoc?.id}
        actions={donThuocActions}
        title="Đơn thuốc"
        entityName={selectedDonThuoc?.tenBenhNhan || 'bản ghi'}
      />
    </div>
  );
};

/* ── STYLESHEET CHO HIGH DENSITY EXCEL GRID ───────────────────────────────── */
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

export { ExaminationPharmacy };
export default ExaminationPharmacy;