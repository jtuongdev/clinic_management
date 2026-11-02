import React, { useEffect, useMemo, useState } from 'react';
import {
  Row,
  Col,
  Tag,
  Progress,
  Typography,
  Space,
  Spin,
  Empty,
} from 'antd';
import {
  ApartmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  HolderOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useExamination } from '../hook/useExamination';
import { KhoaOverviewDto } from '../../department/type/department.type';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

const { Text } = Typography;

type DeptColKey =
  | 'stt'
  | 'tenKhoa'
  | 'tongLuotKham'
  | 'soLuotCho'
  | 'soBacSi'
  | 'trangThai';

interface DeptColumnDef {
  key: DeptColKey;
  label: string;
  align: 'left' | 'center' | 'right';
  isFixed?: boolean;
}

const ALL_COLUMNS: DeptColumnDef[] = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'tenKhoa', label: 'TÊN KHOA KHÁM BỆNH', align: 'left' },
  { key: 'tongLuotKham', label: 'TỔNG LƯỢT KHÁM', align: 'right' },
  { key: 'soLuotCho', label: 'ĐANG CHỜ', align: 'center' },
  { key: 'soBacSi', label: 'SỐ BÁC SĨ', align: 'center' },
  { key: 'trangThai', label: 'TRẠNG THÁI HOẠT ĐỘNG', align: 'center' },
];

const DEFAULT_COL_ORDER: DeptColKey[] = [
  'stt',
  'tenKhoa',
  'tongLuotKham',
  'soLuotCho',
  'soBacSi',
  'trangThai',
];

const ExaminationDepartment: React.FC = () => {
  const {
    khoaOverview,
    loadingKhoaOverview,
    fetchKhoaOverview,
    filters,
  } = useExamination();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resize hook
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    tenKhoa: 260,
    tongLuotKham: 160,
    soLuotCho: 140,
    soBacSi: 130,
    trangThai: 180,
  });

  // Reorder columns
  const [colOrder, setColOrder] = useState<DeptColKey[]>(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState<DeptColKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<DeptColKey | null>(null);

  const handleColDragStart = (e: React.DragEvent, colKey: DeptColKey) => {
    if (colKey === 'stt') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: DeptColKey) => {
    e.preventDefault();
    if (colKey === 'stt' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e: React.DragEvent, targetCol: DeptColKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt') {
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

  // Gọi API khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchKhoaOverview();
  }, [filters]);

  // TDZ-safe: displayedItems before orderedItems
  const displayedItems = useMemo(() => {
    return khoaOverview || [];
  }, [khoaOverview]);

  // Row reordering
  const [orderedItems, setOrderedItems] = useState<KhoaOverviewDto[]>([]);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedItems(displayedItems);
  }, [displayedItems]);

  const handleRowDragStart = (e: React.DragEvent, key: string) => {
    setDraggedRowId(key);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRowDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetKey) {
      setDraggedRowId(null);
      return;
    }
    const current = [...orderedItems];
    const fromIdx = current.findIndex((i) => i.tenKhoa === draggedRowId);
    const toIdx = current.findIndex((i) => i.tenKhoa === targetKey);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedItems(current);
    }
    setDraggedRowId(null);
  };

  // KPI từ dữ liệu khoa
  const kpis = useMemo(() => {
    if (!khoaOverview || khoaOverview.length === 0) return [];
    const tongLuot = khoaOverview.reduce((sum, k) => sum + k.tongLuotKham, 0);
    const tongCho = khoaOverview.reduce((sum, k) => sum + k.soLuotCho, 0);
    const tongBS = khoaOverview.reduce((sum, k) => sum + k.soBacSi, 0);
    const hoatDong = khoaOverview.filter((k) => k.trangThai === 'HoatDong').length;
    const quaTai = khoaOverview.filter((k) => k.trangThai === 'QuaTai').length;

    return [
      {
        label: 'Tổng lượt khám',
        value: tongLuot,
        color: '#0b4f6c',
        icon: <ApartmentOutlined style={{ fontSize: 16, color: '#0b4f6c' }} />,
      },
      {
        label: 'Tổng chờ khám',
        value: tongCho,
        color: '#f59e0b',
        icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} />,
      },
      {
        label: 'Tổng số khoa',
        value: khoaOverview.length,
        color: '#0284c7',
        icon: <ApartmentOutlined style={{ fontSize: 16, color: '#0284c7' }} />,
      },
      {
        label: 'Tổng bác sĩ',
        value: tongBS,
        color: '#8b5cf6',
        icon: <UserOutlined style={{ fontSize: 16, color: '#8b5cf6' }} />,
      },
      {
        label: 'Khoa hoạt động',
        value: hoatDong,
        color: '#10b981',
        icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#10b981' }} />,
      },
      {
        label: 'Khoa quá tải',
        value: quaTai,
        color: '#ef4444',
        icon: <AlertOutlined style={{ fontSize: 16, color: '#ef4444' }} />,
      },
    ];
  }, [khoaOverview]);

  // Dữ liệu cho bar chart số lượng chờ
  const maxWait = useMemo(() => {
    return Math.max(...(khoaOverview || []).map((k) => k.soLuotCho), 1);
  }, [khoaOverview]);

  const waitTimes = useMemo(() => {
    return (khoaOverview || []).map((k) => ({
      name: k.tenKhoa,
      value: k.soLuotCho,
      percent: Math.round((k.soLuotCho / maxWait) * 100),
      color: k.soLuotCho >= 10 ? '#ef4444' : k.soLuotCho >= 5 ? '#f59e0b' : '#10b981',
    }));
  }, [khoaOverview, maxWait]);

  const renderCellContent = (colKey: DeptColKey, item: KhoaOverviewDto, index: number) => {
    switch (colKey) {
      case 'stt':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span title="Kéo thả đổi vị trí dòng" style={{ cursor: 'grab', color: '#94a3b8' }}>
              <HolderOutlined style={{ fontSize: 11 }} />
            </span>
            <span style={{ fontWeight: 600, color: '#475569' }}>
              {index + 1}
            </span>
          </div>
        );

      case 'tenKhoa':
        return (
          <span
            title={item.tenKhoa}
            style={{
              fontWeight: 700,
              color: '#0b4f6c',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.tenKhoa}
          </span>
        );

      case 'tongLuotKham':
        return (
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            {item.tongLuotKham}
          </span>
        );

      case 'soLuotCho':
        return (
          <Tag color={item.soLuotCho >= 10 ? 'error' : item.soLuotCho >= 5 ? 'warning' : 'default'} style={{ margin: 0, fontSize: 11 }}>
            {item.soLuotCho} lượt
          </Tag>
        );

      case 'soBacSi':
        return (
          <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
            {item.soBacSi} BS
          </Tag>
        );

      case 'trangThai': {
        if (item.trangThai === 'QuaTai') return <Tag color="error" style={{ margin: 0, fontSize: 11 }}>Quá tải</Tag>;
        if (item.trangThai === 'HoatDong') return <Tag color="success" style={{ margin: 0, fontSize: 11 }}>Hoạt động bình thường</Tag>;
        return <Tag color="default" style={{ margin: 0, fontSize: 11 }}>Bình thường</Tag>;
      }

      default:
        return null;
    }
  };

  if (loadingKhoaOverview) {
    return <Spin description="Đang tải dữ liệu khoa..." style={{ padding: 40 }} />;
  }

  if (khoaOverview.length === 0) {
    return <Empty description="Không có dữ liệu hiệu suất khoa" style={{ padding: 40 }} />;
  }

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
      {/* Metric Ribbon / Stat Bar */}
      {!isFullscreen && (
        <div style={styles.kpiRibbon}>
          {kpis.map((kpi, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />}
              <div style={styles.kpiItem}>
                {kpi.icon}
                <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>
                  {kpi.value}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Space size="small">
            <ApartmentOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Danh sách khoa khám bệnh
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
            {khoaOverview.length} khoa
          </Tag>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => fetchKhoaOverview()}
            style={styles.btnSecondary}
            title="Làm mới dữ liệu"
          >
            <ReloadOutlined style={{ fontSize: 12 }} />
            <span>Làm mới</span>
          </button>

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

      {/* Main Department Excel Grid */}
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
            {orderedItems.map((item, index) => {
              const isRowDragging = draggedRowId === item.tenKhoa;
              return (
                <tr
                  key={item.tenKhoa}
                  className="h-9 hover:bg-slate-50 transition-colors"
                  style={{
                    opacity: isRowDragging ? 0.35 : 1,
                    backgroundColor: isRowDragging ? '#f1f5f9' : undefined,
                  }}
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, item.tenKhoa)}
                  onDragOver={handleRowDragOver}
                  onDrop={(e) => handleRowDrop(e, item.tenKhoa)}
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
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom: Wait Progress */}
      {!isFullscreen && (
        <Row style={{ borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <Col span={24} style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ClockCircleOutlined style={{ color: '#0b4f6c' }} />
              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                Số lượng bệnh nhân chờ theo khoa
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {waitTimes.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text strong style={{ fontSize: 12, color: '#334155' }}>
                      {item.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <strong>{item.value}</strong> đang chờ
                    </Text>
                  </div>
                  <Progress percent={item.percent} strokeColor={item.color} showInfo={false} size={['100%', 6]} />
                </div>
              ))}
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

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
  gridContainer: {
    margin: '8px 12px 12px 12px',
  },
};

export { ExaminationDepartment };
export default ExaminationDepartment;