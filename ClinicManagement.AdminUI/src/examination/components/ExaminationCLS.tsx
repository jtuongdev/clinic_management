// ExaminationCLS.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Tag,
  Modal,
  Badge,
  message,
  Dropdown,
  Tooltip,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  SearchOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  EyeOutlined,
  ApartmentOutlined,
  ReloadOutlined,
  PrinterOutlined,
  EditOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  HolderOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useExamination } from '../hook/useExamination';
import { examinationApi } from '../api/examination.api';
import type { ChiDinhDichVuListDto } from '../type/examination.types';
import { TiepNhanChiDinhModal } from './cls/TiepNhanChiDinhModal';
import { InPhieuKetQuaModal } from './cls/InPhieuKetQuaModal';
import { ChiTietChiDinhModal } from './cls/ChiTietChiDinhModal';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

type CLSColKey =
  | 'stt'
  | 'maBenhNhanNoiBo'
  | 'tenBenhNhan'
  | 'tenDichVu'
  | 'tenBacSiChiDinh'
  | 'ngayChiDinh'
  | 'trangThai'
  | 'thaoTac';

interface CLSColumnDef {
  key: CLSColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: CLSColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'maBenhNhanNoiBo', label: 'MÃ BN', align: 'left' },
  { key: 'tenBenhNhan', label: 'BỆNH NHÂN', align: 'left' },
  { key: 'tenDichVu', label: 'DỊCH VỤ / XÉT NGHIỆM', align: 'left' },
  { key: 'tenBacSiChiDinh', label: 'BÁC SĨ CHỈ ĐỊNH', align: 'left' },
  { key: 'ngayChiDinh', label: 'THỜI GIAN', align: 'center' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER: CLSColKey[] = [
  'stt',
  'maBenhNhanNoiBo',
  'tenBenhNhan',
  'tenDichVu',
  'tenBacSiChiDinh',
  'ngayChiDinh',
  'trangThai',
  'thaoTac',
];

const ExaminationCLS: React.FC = () => {
  const navigate = useNavigate();
  const {
    chiDinhDichVuList,
    chiDinhDichVuTotal,
    thongKeChiDinhDichVu,
    loadingChiDinhDichVu,
    fetchChiDinhDichVuList,
    fetchThongKeChiDinhDichVu,
    khoas,
  } = useExamination();

  // State bộ lọc
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State Modal
  const [tiepNhanItem, setTiepNhanItem] = useState<ChiDinhDichVuListDto | null>(null);
  const [isTiepNhanOpen, setIsTiepNhanOpen] = useState(false);
  const [inPhieuId, setInPhieuId] = useState<number | null>(null);
  const [isInPhieuOpen, setIsInPhieuOpen] = useState(false);
  const [chiTietId, setChiTietId] = useState<number | null>(null);
  const [isChiTietOpen, setIsChiTietOpen] = useState(false);

  // Column Resizing hook
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    maBenhNhanNoiBo: 110,
    tenBenhNhan: 180,
    tenDichVu: 260,
    tenBacSiChiDinh: 180,
    ngayChiDinh: 140,
    trangThai: 140,
    thaoTac: 110,
  });

  // Column Reordering (Drag & Drop)
  const [colOrder, setColOrder] = useState<CLSColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<CLSColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<CLSColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: CLSColKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: CLSColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: CLSColKey) => {
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

  // Tải dữ liệu
  const reloadData = useCallback(() => {
    fetchChiDinhDichVuList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter,
      loaiDichVu: serviceTypeFilter || undefined,
      trangThai: statusFilter || undefined,
    });
    fetchThongKeChiDinhDichVu({ maKhoa: khoaFilter });
  }, [pageIndex, pageSize, khoaFilter, serviceTypeFilter, statusFilter,
      fetchChiDinhDichVuList, fetchThongKeChiDinhDichVu]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // KPIs
  const kpis = useMemo(() => ([
    { label: 'Tổng chỉ định', value: thongKeChiDinhDichVu?.tongChiDinh ?? 0, color: '#0b4f6c', icon: <ExperimentOutlined style={{ fontSize: 16, color: '#0b4f6c' }} /> },
    { label: 'Đang xử lý',    value: thongKeChiDinhDichVu?.dangXuLy ?? 0,     color: '#0284c7', icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#0284c7' }} /> },
    { label: 'Đã hoàn thành', value: thongKeChiDinhDichVu?.hoanThanh ?? 0,    color: '#10b981', icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#10b981' }} /> },
    { label: 'TB trả kết quả', value: `${thongKeChiDinhDichVu?.tbTraKetQua ?? 0} phút`, color: '#f59e0b', icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} /> },
    { label: 'KQ bất thường', value: thongKeChiDinhDichVu?.batThuong ?? 0,    color: '#ef4444', icon: <AlertOutlined style={{ fontSize: 16, color: '#ef4444' }} /> },
    { label: 'Khoa yêu cầu',  value: thongKeChiDinhDichVu?.khoaYeuCau ?? 0,   color: '#8b5cf6', icon: <ApartmentOutlined style={{ fontSize: 16, color: '#8b5cf6' }} /> },
  ]), [thongKeChiDinhDichVu]);

  // Actions
  const handleOpenChiTiet = (id: number) => {
    setChiTietId(id);
    setIsChiTietOpen(true);
  };

  const handleOpenTiepNhan = (item: ChiDinhDichVuListDto) => {
    setTiepNhanItem(item);
    setIsTiepNhanOpen(true);
  };

  const handleOpenNhapKetQua = (chiDinhId: number) => {
    navigate(`/examination/cls/nhap-ket-qua/${chiDinhId}`);
  };

  const handleOpenInPhieu = (chiDinhId: number) => {
    setInPhieuId(chiDinhId);
    setIsInPhieuOpen(true);
  };

  const handleHuyChiDinh = (item: ChiDinhDichVuListDto) => {
    let lyDoHuy = '';
    Modal.confirm({
      title: `Xác nhận hủy chỉ định: ${item.tenDichVu}`,
      content: (
        <div style={{ marginTop: 12 }}>
          <p>Bệnh nhân: <strong>{item.tenBenhNhan}</strong></p>
          <textarea
            rows={2}
            placeholder="Nhập lý do hủy..."
            style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
            onChange={(e) => { lyDoHuy = e.target.value; }}
          />
        </div>
      ),
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const res = await examinationApi.huyChiDinh(item.id, { lyDo: lyDoHuy });
          if (res.data?.success) {
            message.success('Đã hủy chỉ định');
            reloadData();
          } else {
            message.error(res.data?.message || 'Hủy chỉ định thất bại');
          }
        } catch (err: any) {
          message.error(err?.message || 'Lỗi khi hủy chỉ định');
        }
      },
    });
  };

  // Lọc dữ liệu hiển thị (Đảm bảo TDZ: khai báo displayedItems TRƯỚC orderedItems)
  const displayedItems = useMemo(() => {
    if (!searchKeyword.trim()) return chiDinhDichVuList;
    const kw = searchKeyword.trim().toLowerCase();
    return chiDinhDichVuList.filter((item) =>
      item.tenBenhNhan?.toLowerCase().includes(kw) ||
      item.maBenhNhanNoiBo?.toLowerCase().includes(kw) ||
      item.tenDichVu?.toLowerCase().includes(kw) ||
      item.tenBacSiChiDinh?.toLowerCase().includes(kw)
    );
  }, [chiDinhDichVuList, searchKeyword]);

  // Row reordering (Drag & Drop)
  const [orderedItems, setOrderedItems] = useState<ChiDinhDichVuListDto[]>([]);
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

  // Reset filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setKeywordInput('');
    setServiceTypeFilter('');
    setStatusFilter('');
    setKhoaFilter(undefined);
    setPageIndex(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(keywordInput);
    setPageIndex(1);
  };

  // Render cell helper
  const renderCellContent = (colKey: CLSColKey, item: ChiDinhDichVuListDto, index: number) => {
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

      case 'maBenhNhanNoiBo': {
        const val = item.maBenhNhanNoiBo || `BN-${item.maBenhNhan}`;
        return (
          <span
            title={val}
            style={{
              fontWeight: 700,
              color: '#0b4f6c',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {val}
          </span>
        );
      }

      case 'tenBenhNhan':
        return (
          <span
            title={item.tenBenhNhan}
            style={{
              fontWeight: 600,
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.tenBenhNhan}
          </span>
        );

      case 'tenDichVu': {
        let tagColor = 'blue';
        const type = (item.loaiDichVu || '').toLowerCase();
        if (type.includes('xetnghiem')) tagColor = 'cyan';
        else if (type.includes('chandoan')) tagColor = 'purple';
        else if (type.includes('kythuat')) tagColor = 'orange';

        return (
          <div
            title={`${item.tenDichVu || 'Dịch vụ CLS'}${item.loaiDichVu ? ` (${item.loaiDichVu})` : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}
          >
            <span
              style={{
                fontWeight: 600,
                color: '#1e293b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.tenDichVu || 'Dịch vụ CLS'}
            </span>
            {item.loaiDichVu && (
              <Tag
                color={tagColor}
                style={{
                  fontSize: 10,
                  padding: '0 4px',
                  margin: 0,
                  lineHeight: '16px',
                  borderRadius: 3,
                  flexShrink: 0,
                }}
              >
                {item.loaiDichVu}
              </Tag>
            )}
          </div>
        );
      }

      case 'tenBacSiChiDinh':
        return (
          <div
            title={`${item.tenBacSiChiDinh || ''} - ${item.tenKhoa || ''}`}
            style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
          >
            <span
              style={{
                fontWeight: 500,
                color: '#334155',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.tenBacSiChiDinh || '--'}
            </span>
            {item.tenKhoa && (
              <span
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.tenKhoa}
              </span>
            )}
          </div>
        );

      case 'ngayChiDinh':
        return (
          <span style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
            {item.ngayChiDinh
              ? new Date(item.ngayChiDinh).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--'}
          </span>
        );

      case 'trangThai': {
        switch (item.trangThai) {
          case 'DaChiDinh':
            return <Badge status="warning" text={<span style={{ color: '#d97706', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Chờ tiếp nhận</span>} />;
          case 'DaTiepNhan':
            return <Badge status="processing" text={<span style={{ color: '#0284c7', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Đã tiếp nhận</span>} />;
          case 'ChoKetQua':
            return <Badge status="processing" text={<span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Đang thực hiện</span>} />;
          case 'DaCoKetQua':
            return <Badge status="success" text={<span style={{ color: '#059669', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Đã có kết quả</span>} />;
          case 'DaHuy':
            return <Badge status="default" text={<span style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>Đã hủy</span>} />;
          default:
            return <Tag color="default">{item.trangThai || 'Chờ'}</Tag>;
        }
      }

      case 'thaoTac': {
        const isPending = item.trangThai === 'DaChiDinh';
        const isProcessing = item.trangThai === 'DaTiepNhan' || item.trangThai === 'ChoKetQua';
        const isDone = item.trangThai === 'DaCoKetQua';
        const isCancelled = item.trangThai === 'DaHuy';

        const menuItems: MenuProps['items'] = [
          {
            key: 'chitiet',
            icon: <InfoCircleOutlined style={{ color: '#0b4f6c' }} />,
            label: 'Xem chi tiết CLS & vật tư',
            onClick: () => handleOpenChiTiet(item.id),
          },
        ];

        if (isPending) {
          menuItems.push({ type: 'divider' });
          menuItems.push({
            key: 'tiepnhan',
            icon: <CheckOutlined style={{ color: '#0284c7' }} />,
            label: 'Tiếp nhận chỉ định',
            onClick: () => handleOpenTiepNhan(item),
          });
        }

        if (isProcessing) {
          menuItems.push({ type: 'divider' });
          menuItems.push({
            key: 'nhapkq',
            icon: <EditOutlined style={{ color: '#10b981' }} />,
            label: 'Nhập kết quả',
            onClick: () => handleOpenNhapKetQua(item.id),
          });
        }

        if (isDone) {
          menuItems.push({ type: 'divider' });
          menuItems.push({
            key: 'xemkq',
            icon: <EyeOutlined style={{ color: '#0284c7' }} />,
            label: 'Xem / Sửa kết quả',
            onClick: () => handleOpenNhapKetQua(item.id),
          });
          menuItems.push({
            key: 'inphieu',
            icon: <PrinterOutlined style={{ color: '#0b4f6c' }} />,
            label: 'In phiếu kết quả',
            onClick: () => handleOpenInPhieu(item.id),
          });
        }

        if (!isDone && !isCancelled) {
          menuItems.push({ type: 'divider' });
          menuItems.push({
            key: 'huy',
            danger: true,
            icon: <CloseCircleOutlined />,
            label: 'Hủy chỉ định',
            onClick: () => handleHuyChiDinh(item),
          });
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Tooltip title="Xem chi tiết">
              <button
                type="button"
                onClick={() => handleOpenChiTiet(item.id)}
                style={styles.actionIconButton}
              >
                <InfoCircleOutlined style={{ color: '#0b4f6c' }} />
              </button>
            </Tooltip>

            {isPending && (
              <Tooltip title="Tiếp nhận chỉ định">
                <button
                  type="button"
                  onClick={() => handleOpenTiepNhan(item)}
                  style={{ ...styles.actionIconButton, color: '#0284c7' }}
                >
                  <CheckOutlined />
                </button>
              </Tooltip>
            )}

            {(isProcessing || isDone) && (
              <Tooltip title={isDone ? 'Xem / Sửa kết quả' : 'Nhập kết quả'}>
                <button
                  type="button"
                  onClick={() => handleOpenNhapKetQua(item.id)}
                  style={{ ...styles.actionIconButton, color: '#10b981' }}
                >
                  <EditOutlined />
                </button>
              </Tooltip>
            )}

            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <button type="button" style={styles.actionIconButton}>
                <MoreOutlined style={{ fontSize: 14, color: '#64748b' }} />
              </button>
            </Dropdown>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const totalPages = Math.ceil(chiDinhDichVuTotal / pageSize) || 1;
  const startItemIdx = chiDinhDichVuTotal === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItemIdx = Math.min(pageIndex * pageSize, chiDinhDichVuTotal);

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
                placeholder="Tìm mã BN, tên BN, xét nghiệm..."
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

          {/* Filter: Loại dịch vụ */}
          <select
            value={serviceTypeFilter}
            onChange={(e) => {
              setServiceTypeFilter(e.target.value);
              setPageIndex(1);
            }}
            style={styles.selectFilter}
          >
            <option value="">Tất cả loại dịch vụ</option>
            <option value="XetNghiem">🧪 Xét nghiệm</option>
            <option value="ChanDoanHinhAnh">🩻 Chẩn đoán hình ảnh</option>
            <option value="DichVuKyThuat">🩺 Thủ thuật / Kỹ thuật</option>
          </select>

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
            <option value="DaChiDinh">Chờ tiếp nhận</option>
            <option value="DaTiepNhan">Đã tiếp nhận</option>
            <option value="ChoKetQua">Đang thực hiện</option>
            <option value="DaCoKetQua">Đã có kết quả</option>
            <option value="DaHuy">Đã hủy</option>
          </select>

          {/* Filter: Khoa */}
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

          {/* Button Đặt lại */}
          {(searchKeyword || keywordInput || serviceTypeFilter || statusFilter || khoaFilter !== undefined) && (
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
            onClick={reloadData}
            style={styles.btnSecondary}
            title="Làm mới dữ liệu"
          >
            <ReloadOutlined style={{ fontSize: 12 }} />
            <span>Làm mới</span>
          </button>
        </div>

        <div style={styles.toolbarRight}>
          <span style={styles.summaryBadge}>
            Tổng: <strong>{chiDinhDichVuTotal}</strong> chỉ định
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
            {loadingChiDinhDichVu ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.loadingCell}>
                  <div style={styles.loadingWrapper}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang nạp danh sách chỉ định CLS...</span>
                  </div>
                </td>
              </tr>
            ) : orderedItems.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={styles.emptyCell}>
                  <div style={styles.emptyWrapper}>
                    <ExperimentOutlined style={{ fontSize: 28, color: '#94a3b8' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                      Không có chỉ định cận lâm sàng nào phù hợp
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedItems.map((item, index) => {
                const isRowDragging = draggedRowId === item.id;
                return (
                  <tr
                    key={item.id}
                    className="h-9 hover:bg-slate-50 transition-colors"
                    style={{
                      opacity: isRowDragging ? 0.35 : 1,
                      backgroundColor: isRowDragging ? '#f1f5f9' : undefined,
                    }}
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

      {/* ── FOOTER PAGINATION BAR ────────────────────────────────────────────── */}
      <div style={styles.footerBar}>
        <div style={styles.footerLeft}>
          <span style={styles.pageInfo}>
            Hiển thị <strong>{startItemIdx}</strong> - <strong>{endItemIdx}</strong> /{' '}
            <strong>{chiDinhDichVuTotal}</strong> chỉ định
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

      {/* Modals */}
      <TiepNhanChiDinhModal
        visible={isTiepNhanOpen}
        item={tiepNhanItem}
        onClose={() => {
          setIsTiepNhanOpen(false);
          setTiepNhanItem(null);
        }}
        onSuccess={reloadData}
      />
      <InPhieuKetQuaModal
        visible={isInPhieuOpen}
        chiDinhId={inPhieuId}
        onClose={() => {
          setIsInPhieuOpen(false);
          setInPhieuId(null);
        }}
      />
      <ChiTietChiDinhModal
        visible={isChiTietOpen}
        chiDinhId={chiTietId}
        onClose={() => {
          setIsChiTietOpen(false);
          setChiTietId(null);
        }}
        onOpenNhapKetQua={(id) => {
          setIsChiTietOpen(false);
          handleOpenNhapKetQua(id);
        }}
        onOpenInPhieu={(id) => {
          setIsChiTietOpen(false);
          handleOpenInPhieu(id);
        }}
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
    width: 230,
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

export { ExaminationCLS };
export default ExaminationCLS;