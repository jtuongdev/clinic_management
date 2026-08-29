import React, { useState, useEffect, useCallback } from 'react';
import { useExamination } from '../hook/useExamination';
import ActionBar from '../../shared/components/layouts/components/ActionBar';
import './style/examinationPatients.css';

const ExaminationPatients: React.FC = () => {
  const {
    benhNhanList,
    thongKeBenhNhan,
    benhNhanTotal,
    loadingBenhNhan,
    loadingThongKeBenhNhan,
    fetchBenhNhanList,
    fetchThongKeBenhNhan,
    filters,
    khoas,
  } = useExamination();

  // State bộ lọc và phân trang
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedKhoa, setSelectedKhoa] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  // State fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State ActionBar
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const handleRowClick = (id: number) => {
    setSelectedPatientId(id);
  };

  const handleCloseActionBar = () => {
    setSelectedPatientId(null);
  };

  // Định nghĩa actions cho bệnh nhân
  const patientActions = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary' as const,
      onClick: (id: number | string) => {
        alert(`Xem chi tiết bệnh nhân: ${id}`);
        // Điều hướng hoặc mở modal
      },
    },
    {
      label: 'Sửa',
      icon: 'pen-to-square',
      color: 'warning' as const,
      onClick: (id: number | string) => {
        alert(`Sửa bệnh nhân: ${id}`);
      },
    },
    {
      label: 'Xóa',
      icon: 'trash',
      color: 'danger' as const,
      onClick: (id: number | string) => {
        if (window.confirm(`Bạn có chắc muốn xóa bệnh nhân ${id}?`)) {
          alert(`Xóa bệnh nhân: ${id}`);
          // Gọi API xóa
        }
      },
    },
  ];

  // Hàm tải dữ liệu
  const loadData = useCallback(() => {
    const params: any = {
      pageIndex,
      pageSize,
      keyword: searchKeyword || undefined,
      trangThai: selectedStatus || undefined,
      maKhoa: selectedKhoa || filters.maKhoa || undefined,
      maCoSo: filters.maCoSo || undefined,
    };
    fetchBenhNhanList(params);
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

  // Gọi API khi pageIndex hoặc bộ lọc thay đổi
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    setPageIndex(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const totalPages = Math.ceil(benhNhanTotal / pageSize) || 1;

  const handlePrevPage = () => {
    if (pageIndex > 1) setPageIndex(pageIndex - 1);
  };

  const handleNextPage = () => {
    if (pageIndex < totalPages) setPageIndex(pageIndex + 1);
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { class: string; label: string }> = {
      Cho: { class: 'status-wait', label: 'Chờ khám' },
      DangKham: { class: 'status-doing', label: 'Đang khám' },
      HoanThanh: { class: 'status-done', label: 'Hoàn tất' },
    };
    return map[status] || { class: 'status-idle', label: status || 'Chưa xác định' };
  };

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    const date = new Date(time);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`patients-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-kicker">Bệnh nhân</div>
          <h1 className="page-title">Danh sách người bệnh</h1>
          <div className="page-desc">Tra cứu và theo dõi tình trạng bệnh nhân</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={handleSearch}>
            <i className="fa-solid fa-search" /> Tìm kiếm
          </button>
        </div>
      </div>

      {/* ===== KPI ===== */}
      <div className="kpi-grid">
        {loadingThongKeBenhNhan ? (
          <div>Đang tải thống kê...</div>
        ) : (
          <>
            <div className="kpi kpi-primary">
              <div className="kpi-label">Hôm nay</div>
              <div className="kpi-value">{thongKeBenhNhan?.homNay ?? 0}</div>
            </div>
            <div className="kpi kpi-blue">
              <div className="kpi-label">Chờ</div>
              <div className="kpi-value">{thongKeBenhNhan?.cho ?? 0}</div>
            </div>
            <div className="kpi kpi-green">
              <div className="kpi-label">Đang khám</div>
              <div className="kpi-value">{thongKeBenhNhan?.dangKham ?? 0}</div>
            </div>
            <div className="kpi kpi-green">
              <div className="kpi-label">Hoàn tất</div>
              <div className="kpi-value">{thongKeBenhNhan?.hoanThanh ?? 0}</div>
            </div>
          </>
        )}
      </div>

      {/* ===== PANEL ===== */}
      <div className="patients-panelFlex">
        <div className="panel-header">
          <div className="panel-title">
            <i className="fa-solid fa-users" /> Danh sách
          </div>
          <div className="panel-header-actions">
            <span className="panel-badge">{benhNhanTotal}</span>
            <button className="btn btn-sm btn-icon" onClick={toggleFullscreen}>
              <i className={`fa-solid fa-${isFullscreen ? 'compress' : 'expand'}`} />
            </button>
          </div>
        </div>

        <div className="table-tools">
          <div className="search-box">
            <i className="fa-solid fa-search" />
            <input
              placeholder="Tìm tên, mã BN, SĐT..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Cho">Chờ</option>
            <option value="DangKham">Đang khám</option>
            <option value="HoanThanh">Hoàn tất</option>
          </select>
          <select
            className="filter-select"
            value={selectedKhoa || ''}
            onChange={(e) => setSelectedKhoa(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Tất cả khoa</option>
            {khoas.map((k) => (
              <option key={k.id} value={k.id}>{k.ten}</option>
            ))}
          </select>
          <button className="btn btn-sm" onClick={handleSearch}>
            <i className="fa-solid fa-rotate-right" /> Lọc
          </button>
        </div>

        <div className="patients-tableWrapScroll">
          {loadingBenhNhan ? (
            <div className="loading-state">Đang tải danh sách...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã BN</th>
                  <th>Họ tên</th>
                  <th>Giới tính</th>
                  <th>Tuổi</th>
                  <th>Điện thoại</th>
                  <th>Lượt khám</th>
                  <th>Khoa</th>
                  <th>Bác sĩ</th>
                  <th>Trạng thái</th>
                  <th>Bắt đầu</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {benhNhanList.length === 0 ? (
                  <tr><td colSpan={12} className="text-center">Không có dữ liệu</td></tr>
                ) : (
                  benhNhanList.map((patient, idx) => {
                    const statusInfo = getStatusInfo(patient.trangThaiLuotKham);
                    return (
                      <tr
                        key={patient.id}
                        onClick={() => handleRowClick(patient.id)}
                        style={{ cursor: 'pointer' }}
                        className={selectedPatientId === patient.id ? 'row-selected' : ''}
                      >
                        <td>{patient.soThuTu ?? idx + 1}</td>
                        <td className="cell-code">{patient.maBenhNhanNoiBo}</td>
                        <td className="cell-main">{patient.hoTen}</td>
                        <td>{patient.gioiTinh}</td>
                        <td>{patient.tuoi}</td>
                        <td>{patient.dienThoai}</td>
                        <td>{patient.maLuotKhamGanNhat}</td>
                        <td>{patient.khoa}</td>
                        <td>{patient.bacSi}</td>
                        <td>
                          <span className={`status ${statusInfo.class}`}>
                            <span className="dot" /> {statusInfo.label}
                          </span>
                        </td>
                        <td>{formatTime(patient.thoiGianBatDauKham)}</td>
                        <td>
                          <button className="row-action">
                            <i className="fa-solid fa-eye" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Phân trang */}
        {benhNhanTotal > 0 && (
          <div className="patients-paginationBar">
            <button
              className="btn btn-sm"
              onClick={handlePrevPage}
              disabled={pageIndex <= 1 || loadingBenhNhan}
            >
              <i className="fa-solid fa-chevron-left" /> Trước
            </button>
            <span>
              Trang {pageIndex} / {totalPages}
            </span>
            <button
              className="btn btn-sm"
              onClick={handleNextPage}
              disabled={pageIndex >= totalPages || loadingBenhNhan}
            >
              Sau <i className="fa-solid fa-chevron-right" />
            </button>
            <span className="total-records">Tổng: {benhNhanTotal} bệnh nhân</span>
          </div>
        )}
      </div>

      {/* ActionBar */}
      <ActionBar
        isVisible={!!selectedPatientId}
        onClose={handleCloseActionBar}
        selectedId={selectedPatientId}
        actions={patientActions}
        title="Đã chọn bệnh nhân"
        entityName="BN"
      />
    </div>
  );
};

export default ExaminationPatients;