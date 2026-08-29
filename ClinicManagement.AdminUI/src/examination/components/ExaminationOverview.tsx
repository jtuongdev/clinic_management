import React from 'react';
import { useExamination } from '../hook/useExamination';

const ExaminationOverview: React.FC = () => {
  const {
    thongKe,
    bacSiTruc,
    luotKhamDangXuLy,
    loadingThongKe,
    loadingBacSiTruc,
    loadingLuotKhamDangXuLy,
    error,
  } = useExamination();

  const isLoading = loadingThongKe || loadingBacSiTruc || loadingLuotKhamDangXuLy;

  // Chuyển đổi dữ liệu thống kê thành KPI – an toàn với null/undefined
  const kpis = thongKe
    ? [
        {
          label: 'Lượt khám',
          value: thongKe?.tongLuotKham?.toString() ?? '0',
          meta: 'Tổng',
          color: 'primary' as const,
        },
        {
          label: 'Hôm nay',
          value: thongKe?.homNay?.toString() ?? '0',
          meta: 'Hôm nay',
          color: 'blue' as const,
        },
        {
          label: 'Tuần này',
          value: thongKe?.tuanNay?.toString() ?? '0',
          meta: 'Tuần này',
          color: 'green' as const,
        },
        {
          label: 'Tháng này',
          value: thongKe?.thangNay?.toString() ?? '0',
          meta: 'Tháng này',
          color: 'green' as const,
        },
        {
          label: 'Chờ khám',
          value:
            thongKe?.theoTrangThai?.find((t) => t.trangThai === 'CHO_KHAM')?.soLuong?.toString() ??
            '0',
          meta: 'Đang chờ',
          color: 'orange' as const,
        },
        {
          label: 'Khoa đông nhất',
          value:
            thongKe?.theoKhoa && thongKe.theoKhoa.length > 0
              ? thongKe.theoKhoa[0].tenKhoa
              : '--',
          meta:
            thongKe?.theoKhoa && thongKe.theoKhoa.length > 0
              ? `${thongKe.theoKhoa[0].soLuong} lượt`
              : '',
          color: 'red' as const,
        },
      ]
    : [];

  // Tạo dữ liệu bar chart từ theoKhoa – an toàn với mảng rỗng
  const departments =
    thongKe?.theoKhoa?.map((k, index) => ({
      name: k.tenKhoa,
      value: k.soLuong,
      percent:
        thongKe.tongLuotKham && thongKe.tongLuotKham > 0
          ? Math.round((k.soLuong / thongKe.tongLuotKham) * 100)
          : 0,
      color: ['primary', 'red', 'green', 'orange', 'blue'][index % 5] as
        | 'primary'
        | 'red'
        | 'green'
        | 'orange'
        | 'blue',
    })) || [];

  // Tạo trạng thái hiện tại từ thống kê
  const choKham =
    thongKe?.theoTrangThai?.find((t) => t.trangThai === 'CHO_KHAM')?.soLuong ?? 0;
  const dangKham =
    thongKe?.theoTrangThai?.find((t) => t.trangThai === 'DANG_KHAM')?.soLuong ?? 0;

  const summary = [
    { icon: 'blue', label: 'Chờ khám', sub: 'Toàn hệ thống', value: choKham },
    { icon: 'green', label: 'Đang khám', sub: 'Đang xử lý', value: dangKham },
    { icon: 'primary', label: 'Phòng hoạt động', sub: 'Trong ca', value: '--' },
    { icon: 'orange', label: 'Chờ trung bình', sub: 'Toàn hệ thống', value: '--' },
  ];

  // Hàm lấy tên trạng thái hiển thị
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'doing':
        return 'Đang khám';
      case 'alert':
        return 'Quá tải';
      case 'idle':
        return 'Rảnh';
      default:
        return 'Rảnh';
    }
  };

  // Hàm lấy class CSS cho trạng thái
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'doing':
        return 'status-doing';
      case 'alert':
        return 'status-alert';
      case 'idle':
        return 'status-idle';
      default:
        return 'status-idle';
    }
  };

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Giám sát hoạt động khám bệnh</h1>
          <div className="page-desc">Theo dõi KPI, cảnh báo và tình hình các khoa</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => alert('Xuất báo cáo tổng quan')}>
            <i className="fa-solid fa-file-pdf" /> Báo cáo
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`kpi kpi-${kpi.color}`}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            {kpi.meta && <div className="kpi-meta">{kpi.meta}</div>}
          </div>
        ))}
      </div>

      {/* Alert strip – tạm thời mock */}
      <div className="alert-strip">
        <div className="alert-item alert-red">
          <div className="alert-icon">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div>
            <div className="alert-title">Khoa {departments[0]?.name || 'Nhi'} quá tải</div>
            <div className="alert-text">32 bệnh nhân đang chờ, vượt ngưỡng</div>
          </div>
        </div>
        <div className="alert-item alert-orange">
          <div className="alert-icon">
            <i className="fa-regular fa-clock" />
          </div>
          <div>
            <div className="alert-title">Chờ lâu tại P302</div>
            <div className="alert-text">Thời gian chờ TB 22 phút</div>
          </div>
        </div>
        <div className="alert-item alert-blue">
          <div className="alert-icon">
            <i className="fa-solid fa-user-doctor" />
          </div>
          <div>
            <div className="alert-title">Bác sĩ chưa vào ca</div>
            <div className="alert-text">1 bác sĩ chưa bắt đầu ca đã đăng ký</div>
          </div>
        </div>
      </div>

      {/* Grid 2: Khoa + Trạng thái */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <i className="fa-solid fa-chart-column" /> Tình hình theo khoa
            </div>
            <span className="panel-badge">{departments.length} khoa</span>
          </div>
          <div className="panel-body">
            <div className="bar-list">
              {departments.map((dept, idx) => (
                <div key={idx} className="bar-row">
                  <div className="bar-name">{dept.name}</div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${dept.color}`}
                      style={{ width: `${dept.percent}%` }}
                    />
                  </div>
                  <div className="bar-value">{dept.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <i className="fa-solid fa-gauge-high" /> Trạng thái hiện tại
            </div>
          </div>
          <div className="summary-list">
            {summary.map((item, idx) => (
              <div key={idx} className="summary-row">
                <div className="summary-left">
                  <div className={`summary-icon ${item.icon}`}>
                    <i className="fa-regular fa-clock" />
                  </div>
                  <div>
                    <div className="summary-name">{item.label}</div>
                    <div className="summary-sub">{item.sub}</div>
                  </div>
                </div>
                <div className="summary-value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng lượt khám đang xử lý */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <i className="fa-solid fa-list-check" /> Lượt khám đang xử lý
          </div>
          <span className="panel-badge">{luotKhamDangXuLy.length} lượt</span>
        </div>
        <div className="table-tools">
          <div className="search-box">
            <i className="fa-solid fa-search" />
            <input placeholder="Tìm mã, bệnh nhân, bác sĩ..." />
          </div>
          <select className="filter-select">
            <option>Tất cả trạng thái</option>
            <option>Chờ khám</option>
            <option>Đang khám</option>
            <option>Chờ CLS</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã lượt</th>
                <th>Bệnh nhân</th>
                <th>Khoa</th>
                <th>Bác sĩ</th>
                <th>Phòng</th>
                <th>Bắt đầu</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {luotKhamDangXuLy.length > 0 ? (
                luotKhamDangXuLy.map((item) => (
                  <tr key={item.id}>
                    <td className="cell-code">{item.maLuotKham}</td>
                    <td className="cell-main">{item.tenBenhNhan}</td>
                    <td>{item.khoa}</td>
                    <td>{item.bacSi}</td>
                    <td>{item.phong}</td>
                    <td>
                      {item.thoiGianBatDauKham
                        ? new Date(item.thoiGianBatDauKham).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--'}
                    </td>
                    <td>
                      <span
                        className={`status ${
                          item.trangThai === 'CHO_KHAM' ? 'status-wait' : 'status-doing'
                        }`}
                      >
                        <span className="dot" />
                        {item.trangThai === 'CHO_KHAM' ? 'Chờ khám' : 'Đang khám'}
                      </span>
                    </td>
                    <td>
                      <button className="row-action">
                        <i className="fa-solid fa-angle-right" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center" style={{ color: '#94a3b8', padding: '20px' }}>
                    Không có lượt khám đang xử lý
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline + Doctors */}
      <div className="grid-2-eq">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <i className="fa-regular fa-clock" /> Hoạt động gần đây
            </div>
          </div>
          <div className="timeline">
            <div className="tl-item">
              <div className="tl-time">08:45</div>
              <div className="tl-dot green" />
              <div className="tl-content">
                <strong>Hoàn thành khám</strong> · Nguyễn Văn An tại P101
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-time">08:39</div>
              <div className="tl-dot orange" />
              <div className="tl-content">
                <strong>Chờ kết quả CLS</strong> · Ngô Thị Hoa
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-time">08:32</div>
              <div className="tl-dot" />
              <div className="tl-content">
                <strong>Bắt đầu khám</strong> · Lê Văn Cường tại P302
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-time">08:20</div>
              <div className="tl-dot red" />
              <div className="tl-content">
                <strong>Cảnh báo chờ lâu</strong> · Khoa Nhi
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <i className="fa-solid fa-user-doctor" /> Bác sĩ trực
            </div>
            <span className="panel-badge">{bacSiTruc.length}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bác sĩ</th>
                  <th>Khoa</th>
                  <th>Phòng</th>
                  <th>Trạng thái</th>
                  <th>Số chờ</th>
                </tr>
              </thead>
              <tbody>
                {bacSiTruc.length > 0 ? (
                  bacSiTruc.map((doc) => (
                    <tr key={doc.id}>
                      <td className="cell-main">{doc.hoTen}</td>
                      <td>{doc.khoa}</td>
                      <td>{doc.phong}</td>
                      <td>
                        <span className={`status ${getStatusClass(doc.trangThai)}`}>
                          <span className="dot" /> {getStatusLabel(doc.trangThai)}
                        </span>
                      </td>
                      <td className="text-center">{doc.soLuongCho}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ color: '#94a3b8', padding: '20px' }}>
                      Không có bác sĩ trực
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExaminationOverview;