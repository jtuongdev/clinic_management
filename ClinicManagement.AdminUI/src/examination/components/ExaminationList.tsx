import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useExamination } from '../hook/useExamination';
import ActionBar from '../../shared/components/layouts/components/ActionBar';
import { LuotKhamItemDto } from '../type/examination.types';

const ExaminationList: React.FC = () => {
  const {
    luotKhamList,
    luotKhamTotal,
    thongKeKhamBenh,
    loadingLuotKham,
    loadingThongKeKhamBenh,
    fetchLuotKhamList,
    fetchThongKeKhamBenh,
    filters,
    khoas,
  } = useExamination();

  // State bộ lọc cục bộ
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State ActionBar
  const [selectedItem, setSelectedItem] = useState<LuotKhamItemDto | null>(null);

  // Tải danh sách lượt khám
  useEffect(() => {
    fetchLuotKhamList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter || filters.maKhoa,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, statusFilter, filters.maKhoa, fetchLuotKhamList]);

  // Tải thống kê
  useEffect(() => {
    if (filters.maCoSo) {
      fetchThongKeKhamBenh({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
    }
  }, [filters.maCoSo, filters.maKhoa, fetchThongKeKhamBenh]);

  // Xây dựng KPI
  const kpis = useMemo(() => {
    if (!thongKeKhamBenh) {
      return [
        { label: 'Tổng', value: '0', color: 'primary' },
        { label: 'Chờ', value: '0', color: 'blue' },
        { label: 'Đang khám', value: '0', color: 'green' },
        { label: 'Chờ CLS', value: '0', color: 'orange' },
        { label: 'Hoàn tất', value: '0', color: 'green' },
      ];
    }
    const { cho, dangKham, choCLS, hoanThanh } = thongKeKhamBenh;
    const total = cho + dangKham + choCLS + hoanThanh;
    return [
      { label: 'Tổng', value: String(total), color: 'primary' },
      { label: 'Chờ', value: String(cho), color: 'blue' },
      { label: 'Đang khám', value: String(dangKham), color: 'green' },
      { label: 'Chờ CLS', value: String(choCLS), color: 'orange' },
      { label: 'Hoàn tất', value: String(hoanThanh), color: 'green' },
    ];
  }, [thongKeKhamBenh]);

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      Cho: 'status-wait',
      DangKham: 'status-doing',
      ChoCLS: 'status-alert',
      HoanThanh: 'status-done',
    };
    return map[status] || 'status-idle';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Cho: 'Chờ khám',
      DangKham: 'Đang khám',
      ChoCLS: 'Chờ CLS',
      HoanThanh: 'Hoàn tất',
    };
    return map[status] || status;
  };

  const handleRowClick = (item: LuotKhamItemDto) => {
    setSelectedItem(item);
  };

  const closeActionBar = () => {
    setSelectedItem(null);
  };

  // Định nghĩa actions cho lượt khám
  const examActions = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary' as const,
      onClick: (id: number | string) => {
        alert(`Xem chi tiết lượt khám: ${id}`);
      },
    },
    {
      label: 'Bắt đầu khám',
      icon: 'play',
      color: 'success' as const,
      onClick: (id: number | string) => {
        alert(`Bắt đầu khám cho lượt: ${id}`);
      },
    },
    {
      label: 'Hủy',
      icon: 'ban',
      color: 'danger' as const,
      onClick: (id: number | string) => {
        if (window.confirm(`Hủy lượt khám ${id}?`)) {
          alert(`Hủy lượt khám: ${id}`);
        }
      },
    },
  ];

  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setPageIndex(1);
  }, []);

  const handlePrevPage = () => setPageIndex(p => Math.max(1, p - 1));
  const handleNextPage = () => setPageIndex(p => p + 1);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div className={`examination-list-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Header và KPI - ẩn khi fullscreen */}
      {!isFullscreen && (
        <>
          <div className="page-header">
            <div>
              <div className="page-kicker">Khám bệnh</div>
              <h1 className="page-title">Theo dõi lượt khám</h1>
              <div className="page-desc">Trạng thái, tiến độ và bác sĩ phụ trách</div>
            </div>
          </div>

          <div className="kpi-grid">
            {loadingThongKeKhamBenh ? (
              <div>Đang tải thống kê...</div>
            ) : (
              kpis.map((kpi, idx) => (
                <div key={idx} className={`kpi kpi-${kpi.color}`}>
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value">{kpi.value}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <i className="fa-solid fa-list" /> Danh sách lượt khám
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="panel-badge">{luotKhamTotal}</span>
            <button className="btn btn-sm btn-icon" onClick={toggleFullscreen}>
              {isFullscreen ? '⤢' : '⤡'}
            </button>
          </div>
        </div>
        <div className="table-tools">
          <div className="search-box">
            <i className="fa-solid fa-search" />
            <input
              placeholder="Tìm mã, bệnh nhân, bác sĩ..."
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Cho">Chờ khám</option>
            <option value="DangKham">Đang khám</option>
            <option value="ChoCLS">Chờ CLS</option>
            <option value="HoanThanh">Hoàn tất</option>
          </select>
          <select
            className="filter-select"
            value={khoaFilter || ''}
            onChange={(e) => { setKhoaFilter(e.target.value ? Number(e.target.value) : undefined); setPageIndex(1); }}
          >
            <option value="">Tất cả khoa</option>
            {khoas.map(khoa => (
              <option key={khoa.id} value={khoa.id}>{khoa.ten}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã BN</th>
                <th>Bệnh nhân</th>
                <th>Khoa</th>
                <th>BS</th>
                <th>Phòng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loadingLuotKham ? (
                <tr><td colSpan={8}>Đang tải...</td></tr>
              ) : luotKhamList.length === 0 ? (
                <tr><td colSpan={8}>Không có dữ liệu</td></tr>
              ) : (
                luotKhamList.map((exam) => (
                  <tr
                    key={exam.id}
                    onClick={() => handleRowClick(exam)}
                    style={{ cursor: 'pointer' }}
                    className={selectedItem?.id === exam.id ? 'row-selected' : ''}
                  >
                    <td className="cell-code">{exam.maBenhNhanNoiBo}</td>
                    <td className="cell-main">{exam.tenBenhNhan}</td>
                    <td>{exam.tenKhoa}</td>
                    <td>{exam.tenBacSi}</td>
                    <td>{exam.tenPhongKham}</td>
                    <td>{exam.thoiGianBatDauKham ? new Date(exam.thoiGianBatDauKham).toLocaleTimeString('vi-VN') : '--'}</td>
                    <td>
                      <span className={`status ${getStatusClass(exam.trangThai)}`}>
                        <span className="dot" /> {getStatusLabel(exam.trangThai)}
                      </span>
                    </td>
                    <td><button className="row-action"><i className="fa-solid fa-eye" /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '12px 16px' }}>
          <button onClick={handlePrevPage} disabled={pageIndex === 1} className="btn btn-secondary">
            Trước
          </button>
          <span style={{ padding: '6px 12px' }}>Trang {pageIndex}</span>
          <button onClick={handleNextPage} disabled={luotKhamList.length < pageSize} className="btn btn-secondary">
            Sau
          </button>
        </div>
      </div>

      {/* ActionBar */}
      <ActionBar
        isVisible={!!selectedItem}
        onClose={closeActionBar}
        selectedId={selectedItem?.id}
        actions={examActions}
        title="Đã chọn lượt khám"
        entityName={selectedItem?.tenBenhNhan || 'LK'}
      />
    </div>
  );
};

export default ExaminationList;