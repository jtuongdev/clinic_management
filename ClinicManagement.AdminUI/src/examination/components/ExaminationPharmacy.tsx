import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useExamination } from '../hook/useExamination';
import ActionBar, { ActionItem } from '../../shared/components/layouts/components/ActionBar';
import { DonThuocListDto } from '../type/prescription.examination.type';

interface KpiItem {
  label: string;
  value: string;
  color: 'primary' | 'blue' | 'green' | 'orange' | 'red';
}

const ExaminationPharmacy: React.FC = () => {
  const {
    donThuocList,
    donThuocTotal,
    thongKeDonThuoc,
    loadingDonThuoc,
    loadingThongKeDonThuoc,
    fetchDonThuocList,
    fetchThongKeDonThuoc,
    khoas,
    filters,
  } = useExamination();

  // State bộ lọc
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State cho ActionBar
  const [selectedDonThuoc, setSelectedDonThuoc] = useState<DonThuocListDto | null>(null);
  const [showActionBar, setShowActionBar] = useState(false);

  // Hàm xử lý click vào dòng
  const handleRowClick = (item: DonThuocListDto) => {
    setSelectedDonThuoc(item);
    setShowActionBar(true);
  };

  // Đóng ActionBar
  const handleCloseActionBar = () => {
    setShowActionBar(false);
    setSelectedDonThuoc(null);
  };

  // Các hành động cho đơn thuốc
  const donThuocActions: ActionItem[] = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary',
      onClick: (id: number | string) => {
        alert(`Xem chi tiết đơn thuốc ID: ${id}`);
        // Điều hướng đến trang chi tiết đơn thuốc
        // navigate(`/don-thuoc/${id}`);
      },
    },
    {
      label: 'Duyệt',
      icon: 'check',
      color: 'success',
      onClick: (id: number | string) => {
        if (window.confirm(`Duyệt đơn thuốc ID: ${id}?`)) {
          // Gọi API duyệt đơn thuốc
          alert(`Đã duyệt đơn thuốc ${id}`);
        }
      },
    },
    {
      label: 'Xuất thuốc',
      icon: 'truck',
      color: 'info',
      onClick: (id: number | string) => {
        alert(`Xuất thuốc cho đơn: ${id}`);
        // Mở modal xuất thuốc
      },
    },
    {
      label: 'Hủy',
      icon: 'trash',
      color: 'danger',
      onClick: (id: number | string) => {
        if (window.confirm(`Hủy đơn thuốc ID: ${id}?`)) {
          // Gọi API hủy đơn thuốc
          alert(`Đã hủy đơn thuốc ${id}`);
        }
      },
    },
  ];

  // Tải danh sách đơn thuốc
  useEffect(() => {
    fetchDonThuocList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter || filters.maKhoa,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, statusFilter, filters.maKhoa, fetchDonThuocList]);

  // Tải thống kê
  useEffect(() => {
    fetchThongKeDonThuoc({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
  }, [filters.maCoSo, filters.maKhoa, fetchThongKeDonThuoc]);

  // Xây dựng KPI
  const kpis = useMemo(() => {
    if (!thongKeDonThuoc) {
      return [
        { label: 'Đơn thuốc', value: '0', color: 'primary' },
        { label: 'Tạm', value: '0', color: 'blue' },
        { label: 'Đã duyệt', value: '0', color: 'green' },
        { label: 'Đã xuất', value: '0', color: 'green' },
        { label: 'Đã hủy', value: '0', color: 'red' },
        { label: 'Tồn kho', value: '0', color: 'primary' },
      ];
    }
    return [
      { label: 'Đơn thuốc', value: String(thongKeDonThuoc.tongDonThuoc), color: 'primary' },
      { label: 'Tạm', value: String(thongKeDonThuoc.tam), color: 'blue' },
      { label: 'Đã duyệt', value: String(thongKeDonThuoc.daDuyet), color: 'green' },
      { label: 'Đã xuất', value: String(thongKeDonThuoc.daXuatHet), color: 'green' },
      { label: 'Đã hủy', value: String(thongKeDonThuoc.daHuy), color: 'red' },
      { label: 'Tồn kho', value: '0', color: 'primary' }, // TODO: gọi API tồn kho
    ];
  }, [thongKeDonThuoc]);

  // Mapping trạng thái
  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      TAM: 'status-wait',
      DA_DUYET: 'status-doing',
      DA_XUAT_HET: 'status-done',
      HUY: 'status-idle',
    };
    return map[status] || 'status-idle';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      TAM: 'Tạm',
      DA_DUYET: 'Đã duyệt',
      DA_XUAT_HET: 'Đã xuất',
      HUY: 'Đã hủy',
    };
    return map[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const handlePrevPage = () => setPageIndex(p => Math.max(1, p - 1));
  const handleNextPage = () => setPageIndex(p => p + 1);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  return (
    <div className={`examination-pharmacy-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {!isFullscreen && (
        <>
          <div className="page-header">
            <div>
              <div className="page-kicker">Dược</div>
              <h1 className="page-title">Tồn kho & đơn thuốc</h1>
              <div className="page-desc">Cảnh báo tồn, đơn thuốc đã xuất</div>
            </div>
          </div>

          <div className="kpi-grid">
            {loadingThongKeDonThuoc ? (
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

      <div className="grid-2">
        {/* Cột trái: Danh sách đơn thuốc */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <i className="fa-regular fa-list" /> Đơn thuốc
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="panel-badge">{donThuocTotal}</span>
              <button className="btn btn-sm btn-icon" onClick={toggleFullscreen}>
                {isFullscreen ? '⤢' : '⤡'}
              </button>
            </div>
          </div>
          <div className="table-tools">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(1); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="TAM">Tạm</option>
              <option value="DA_DUYET">Đã duyệt</option>
              <option value="DA_XUAT_HET">Đã xuất</option>
              <option value="HUY">Đã hủy</option>
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
                  <th>Bệnh nhân</th>
                  <th>Khoa</th>
                  <th>BS</th>
                  <th>Số loại</th>
                  <th>Tổng tiền</th>
                  <th>Ngày kê</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loadingDonThuoc ? (
                  <tr><td colSpan={8}>Đang tải...</td></tr>
                ) : donThuocList.length === 0 ? (
                  <tr><td colSpan={8}>Không có dữ liệu</td></tr>
                ) : (
                  donThuocList.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      style={{ cursor: 'pointer' }}
                      className={selectedDonThuoc?.id === item.id ? 'row-selected' : ''}
                    >
                      <td className="cell-main">{item.tenBenhNhan}</td>
                      <td>{item.tenKhoa}</td>
                      <td>{item.tenBacSi}</td>
                      <td>{item.soLuongThuoc}</td>
                      <td>{formatCurrency(item.tongTien)}</td>
                      <td>{formatDate(item.ngayKe)}</td>
                      <td>
                        <span className={`status ${getStatusClass(item.trangThai)}`}>
                          <span className="dot" /> {getStatusLabel(item.trangThai)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="row-action"
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn không trigger hàng
                            handleRowClick(item);
                          }}
                        >
                          <i className="fa-solid fa-eye" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '12px 16px' }}>
            <button onClick={handlePrevPage} disabled={pageIndex === 1} className="btn btn-sm">
              Trước
            </button>
            <span style={{ padding: '6px 12px' }}>Trang {pageIndex}</span>
            <button onClick={handleNextPage} disabled={donThuocList.length < pageSize} className="btn btn-sm">
              Sau
            </button>
          </div>
        </div>

        {/* Cột phải: Cảnh báo tồn kho (tạm thời mock) */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <i className="fa-regular fa-triangle-exclamation" /> Cảnh báo tồn kho
            </div>
            <span className="panel-badge">2</span>
          </div>
          <div className="summary-list">
            <div className="summary-row" style={{ borderLeft: '3px solid var(--red)', paddingLeft: 8 }}>
              <div className="summary-left">
                <div>
                  <div className="summary-name" style={{ color: 'var(--red)' }}>Paracetamol 500mg</div>
                  <div className="summary-sub">Còn 20 viên, dưới ngưỡng 50</div>
                </div>
              </div>
              <div className="summary-value" style={{ color: 'var(--red)' }}>⚠️</div>
            </div>
            <div className="summary-row" style={{ borderLeft: '3px solid var(--orange)', paddingLeft: 8 }}>
              <div className="summary-left">
                <div>
                  <div className="summary-name" style={{ color: 'var(--orange)' }}>Amoxicillin 250mg</div>
                  <div className="summary-sub">Hết hạn trong 3 ngày</div>
                </div>
              </div>
              <div className="summary-value" style={{ color: 'var(--orange)' }}>⚠️</div>
            </div>
          </div>
          <div style={{ padding: '8px 16px', textAlign: 'right' }}>
            <button className="btn btn-sm">Xem kho →</button>
          </div>
        </div>
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

export default ExaminationPharmacy;