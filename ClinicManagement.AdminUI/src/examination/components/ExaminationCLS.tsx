import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useExamination } from '../hook/useExamination';
import './style/examinationCLS.css'; // Import CSS riêng

// Interface cho KPI
interface KpiItem {
  label: string;
  value: string;
  color: 'primary' | 'blue' | 'green' | 'orange' | 'red';
}

const ExaminationCLS: React.FC = () => {
  const {
    chiDinhDichVuList,
    chiDinhDichVuTotal,
    thongKeChiDinhDichVu,
    loadingChiDinhDichVu,
    loadingThongKeChiDinhDichVu,
    fetchChiDinhDichVuList,
    fetchThongKeChiDinhDichVu,
    khoas,
  } = useExamination();

  // State bộ lọc cục bộ
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tải danh sách khi bộ lọc hoặc phân trang thay đổi
  useEffect(() => {
    fetchChiDinhDichVuList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, statusFilter, fetchChiDinhDichVuList]);

  // Tải thống kê
  useEffect(() => {
    fetchThongKeChiDinhDichVu({ maKhoa: khoaFilter });
  }, [khoaFilter, fetchThongKeChiDinhDichVu]);

  // Xây dựng KPI
  const kpis = useMemo(() => {
    if (!thongKeChiDinhDichVu) {
      return [
        { label: 'Chỉ định', value: '0', color: 'primary' },
        { label: 'Đang xử lý', value: '0', color: 'blue' },
        { label: 'Hoàn thành', value: '0', color: 'green' },
        { label: 'TB trả kq', value: '0', color: 'orange' },
        { label: 'Bất thường', value: '0', color: 'red' },
        { label: 'Khoa yêu cầu', value: '0', color: 'primary' },
      ];
    }
    return [
      { label: 'Chỉ định', value: String(thongKeChiDinhDichVu.tongChiDinh), color: 'primary' },
      { label: 'Đang xử lý', value: String(thongKeChiDinhDichVu.dangXuLy), color: 'blue' },
      { label: 'Hoàn thành', value: String(thongKeChiDinhDichVu.hoanThanh), color: 'green' },
      { label: 'TB trả kq', value: String(thongKeChiDinhDichVu.tbTraKetQua), color: 'orange' },
      { label: 'Bất thường', value: String(thongKeChiDinhDichVu.batThuong), color: 'red' },
      { label: 'Khoa yêu cầu', value: String(thongKeChiDinhDichVu.khoaYeuCau), color: 'primary' },
    ];
  }, [thongKeChiDinhDichVu]);

  // Mapping trạng thái
  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      DaChiDinh: 'status-wait',
      DaTiepNhan: 'status-doing',
      ChoKetQua: 'status-alert',
      DaCoKetQua: 'status-done',
      DaHuy: 'status-idle',
    };
    return map[status] || 'status-idle';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      DaChiDinh: 'Chờ xử lý',
      DaTiepNhan: 'Đang xử lý',
      ChoKetQua: 'Chờ kết quả',
      DaCoKetQua: 'Hoàn thành',
      DaHuy: 'Đã hủy',
    };
    return map[status] || status;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPageIndex(1);
  };

  const handlePrevPage = () => setPageIndex(p => Math.max(1, p - 1));
  const handleNextPage = () => setPageIndex(p => p + 1);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  return (
    <div className={`cls-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {!isFullscreen && (
        <>
          <div className="page-header">
            <div>
              <div className="page-kicker">CLS</div>
              <h1 className="page-title">Cận lâm sàng</h1>
              <div className="page-desc">Chỉ định, trạng thái và kết quả xét nghiệm</div>
            </div>
          </div>

          <div className="kpi-grid">
            {loadingThongKeChiDinhDichVu ? (
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
            <i className="fa-solid fa-flask" /> Danh sách chỉ định
          </div>
          <div className="panel-header-actions">
            <span className="panel-badge">{chiDinhDichVuTotal}</span>
            <button className="btn btn-sm btn-icon" onClick={toggleFullscreen}>
              <i className={`fa-solid fa-${isFullscreen ? 'compress' : 'expand'}`} />
            </button>
          </div>
        </div>

        <div className="table-tools">
          <div className="search-box">
            <i className="fa-solid fa-search" />
            <input
              placeholder="Tìm bệnh nhân, loại xét nghiệm..."
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
            <option value="DaChiDinh">Chờ xử lý</option>
            <option value="DaTiepNhan">Đang xử lý</option>
            <option value="ChoKetQua">Chờ kết quả</option>
            <option value="DaCoKetQua">Hoàn thành</option>
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

        <div className="cls-tableWrapScroll">
          {loadingChiDinhDichVu ? (
            <div>Đang tải...</div>
          ) : chiDinhDichVuList.length === 0 ? (
            <table>
              <tbody>
                <tr><td colSpan={8} className="text-center">Không có dữ liệu</td></tr>
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bệnh nhân</th>
                  <th>Loại</th>
                  <th>BS chỉ định</th>
                  <th>Khoa</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {chiDinhDichVuList.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{String((pageIndex - 1) * pageSize + idx + 1).padStart(2, '0')}</td>
                    <td className="cell-main">{item.tenBenhNhan}</td>
                    <td>{item.tenDichVu}</td>
                    <td>{item.tenBacSiChiDinh}</td>
                    <td>{item.tenKhoa}</td>
                    <td>{formatDate(item.ngayChiDinh)}</td>
                    <td>
                      <span className={`status ${getStatusClass(item.trangThai)}`}>
                        <span className="dot" /> {getStatusLabel(item.trangThai)}
                      </span>
                    </td>
                    <td>
                      <button className="row-action">
                        <i className="fa-solid fa-eye" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Phân trang */}
        {chiDinhDichVuTotal > 0 && (
          <div className="cls-paginationBar">
            <button
              className="btn btn-sm"
              onClick={handlePrevPage}
              disabled={pageIndex <= 1 || loadingChiDinhDichVu}
            >
              <i className="fa-solid fa-chevron-left" /> Trước
            </button>
            <span>
              Trang {pageIndex} / {Math.ceil(chiDinhDichVuTotal / pageSize)}
            </span>
            <button
              className="btn btn-sm"
              onClick={handleNextPage}
              disabled={pageIndex >= Math.ceil(chiDinhDichVuTotal / pageSize) || loadingChiDinhDichVu}
            >
              Sau <i className="fa-solid fa-chevron-right" />
            </button>
            <span className="total-records">Tổng: {chiDinhDichVuTotal} chỉ định</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminationCLS;