import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueueExtended } from '../hook/useQueuExaminationList';
import { type HangDoiDto } from '../type/queue.type';
import '../../styles/components/QueuePanel.css';

interface QueuePanelProps {
  onOpenDetail?: (patient: HangDoiDto) => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ onOpenDetail }) => {
  // State bộ lọc cục bộ
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Sử dụng hook quản lý hàng đợi
  const {
    patients,
    totalCount,
    pageIndex,
    pageSize,
    loading,
    error,
    fetchQueue,
    goToPage,
    setPageSize,
    refresh,
  } = useQueueExtended({
    autoFetch: true,
    initialPage: 1,
    initialPageSize: 10,
  });

  // Lọc danh sách theo từ khóa và bộ lọc
  const filteredPatients = useMemo(() => {
    let result = patients;

    // Tìm kiếm theo tên hoặc mã
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      result = result.filter(p =>
        p.hoTen.toLowerCase().includes(keyword) ||
        p.maBenhNhanNoiBo.toLowerCase().includes(keyword)
      );
    }

    // Lọc theo trạng thái (mapping từ statusFilter)
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string[]> = {
        wait: ['CHO_KHAM'],
        exam: ['DANG_KHAM'],
        done: ['HOAN_THANH'],
        cancel: ['DA_HUY'],
      };
      const allowedStatuses = statusMap[statusFilter] || [];
      result = result.filter(p => allowedStatuses.includes(p.trangThai));
    }

    // Lọc theo mức ưu tiên (hiện tại chưa có dữ liệu ưu tiên từ API)
    if (priorityFilter !== 'all') {
      // Nếu API có trường priority, thêm logic tại đây
      // result = result.filter(p => p.priority === priorityFilter);
    }

    return result;
  }, [patients, search, statusFilter, priorityFilter]);

  // Tính số lượng bệnh nhân đang chờ, đang khám...
  const stats = useMemo(() => {
    const waiting = patients.filter(p => p.trangThai === 'CHO_KHAM').length;
    const examining = patients.filter(p => p.trangThai === 'DANG_KHAM').length;
    const done = patients.filter(p => p.trangThai === 'HOAN_THANH').length;
    return { waiting, examining, done, total: patients.length };
  }, [patients]);

  // Xử lý gọi bệnh nhân
  const callPatient = (patient: HangDoiDto) => {
    if (window.confirm(`Gọi bệnh nhân ${patient.hoTen} vào khám?`)) {
      // TODO: Gọi API cập nhật trạng thái
      alert(`Đã gọi ${patient.hoTen} vào phòng khám.`);
    }
  };

  // Xử lý chọn bệnh nhân để xem chi tiết
  const handleOpenDetail = (patient: HangDoiDto) => {
    if (onOpenDetail) {
      onOpenDetail(patient);
    }
  };

  // Refresh thủ công
  const handleRefresh = () => {
    refresh();
  };

  // Render trạng thái
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      CHO_KHAM: 'Đang chờ',
      DANG_KHAM: 'Đang khám',
      HOAN_THANH: 'Đã khám',
      DA_HUY: 'Đã hủy',
    };
    return map[status] || status;
  };

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      CHO_KHAM: 'wait',
      DANG_KHAM: 'exam',
      HOAN_THANH: 'done',
      DA_HUY: 'cancel',
    };
    return map[status] || 'wait';
  };

  return (
    <div className="panel-queue active">
      {/* KPI */}
      <section className="kpis">
        <div className="kpi">
          <div>
            <div className="kpi-label">Tổng lượt hôm nay</div>
            <div className="kpi-value">{totalCount}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-users"></i></div>
        </div>
        <div className="kpi warning">
          <div>
            <div className="kpi-label">Đang chờ</div>
            <div className="kpi-value">{stats.waiting}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-clock"></i></div>
        </div>
        <div className="kpi success">
          <div>
            <div className="kpi-label">Đang khám</div>
            <div className="kpi-value">{stats.examining}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-user-doctor"></i></div>
        </div>
        <div className="kpi info">
          <div>
            <div className="kpi-label">Đã hoàn thành</div>
            <div className="kpi-value">{stats.done}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-circle-check"></i></div>
        </div>
        <div className="kpi danger">
          <div>
            <div className="kpi-label">Ưu tiên / cảnh báo</div>
            <div className="kpi-value">0</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
        </div>
      </section>

      <section className="queue-card">
        <div className="queue-head">
          <div className="queue-title">
            <i className="fa-solid fa-users-line"></i> Danh sách bệnh nhân chờ khám
          </div>
          <span className="queue-count">{stats.waiting} đang chờ</span>
          <div className="filters">
            <div className="search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Tìm tên, mã bệnh nhân..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="wait">Đang chờ</option>
              <option value="exam">Đang khám</option>
              <option value="done">Đã khám</option>
              <option value="cancel">Đã hủy</option>
            </select>
            <select
              className="select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Mọi mức ưu tiên</option>
              <option value="urgent">Ưu tiên</option>
              <option value="normal">Bình thường</option>
            </select>
            <button className="icon-btn" onClick={handleRefresh}>
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>

        <div className="summary">
          <span><i className="dot wait"></i> Chờ khám: {stats.waiting}</span>
          <span><i className="dot exam"></i> Đang khám: {stats.examining}</span>
          <span><i className="dot done"></i> Đã khám: {stats.done}</span>
          <span><i className="dot priority"></i> Có cảnh báo: 0</span>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
          ) : (
            <table className="queue-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Bệnh nhân</th>
                  <th>Thông tin</th>
                  <th>Lượt khám</th>
                  <th>Ưu tiên</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                      Không có bệnh nhân nào trong hàng đợi
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const statusClass = getStatusClass(patient.trangThai);
                    const statusLabel = getStatusLabel(patient.trangThai);
                    const timeDisplay = patient.thoiGianCapNhat
                      ? new Date(patient.thoiGianCapNhat).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '--:--';

                    return (
                      <tr key={patient.id} className={statusClass === 'exam' ? 'current' : ''}>
                        <td><div className="queue-no">{patient.soThuTu ?? '--'}</div></td>
                        <td>
                          <div className="patient">
                            <div className="avatar-sm">
                              {patient.hoTen.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="patient-name">
                                {patient.hoTen}
                              </div>
                              <div className="patient-code">{patient.maBenhNhanNoiBo}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="gender-age">
                            {patient.gioiTinh === 'M' ? 'Nam' : 'Nữ'} · {patient.tuoi} tuổi
                          </div>
                        </td>
                        <td>
                          <div className="visit">
                            <strong>{patient.maLuotKham}</strong>
                            <br />
                            {patient.tenKhoa}
                          </div>
                        </td>
                        <td>
                          <span className="priority normal">Bình thường</span>
                        </td>
                        <td><span className="time">{timeDisplay}</span></td>
                        <td>
                          <span className={`status ${statusClass}`}>
                            <i className="fa-solid fa-circle"></i> {statusLabel}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            {patient.trangThai === 'DANG_KHAM' && (
                              <button
                                className="action exam"
                                onClick={() => handleOpenDetail(patient)}
                              >
                                <i className="fa-solid fa-stethoscope"></i> Vào khám
                              </button>
                            )}
                            {patient.trangThai === 'HOAN_THANH' && (
                              <button
                                className="action"
                                onClick={() => handleOpenDetail(patient)}
                              >
                                <i className="fa-regular fa-eye"></i> Xem hồ sơ
                              </button>
                            )}
                            {patient.trangThai === 'CHO_KHAM' && (
                              <>
                                <button
                                  className="action"
                                  onClick={() => handleOpenDetail(patient)}
                                >
                                  <i className="fa-regular fa-eye"></i> Xem
                                </button>
                                <button
                                  className="action call"
                                  onClick={() => callPatient(patient)}
                                >
                                  <i className="fa-solid fa-bullhorn"></i> Gọi khám
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="queue-footer">
          <div className="footer-note">
            <i className="fa-solid fa-circle-info"></i>
            Hiển thị {filteredPatients.length} / {totalCount} bệnh nhân
          </div>
          <div className="pagination">
            <button
              className="page"
              onClick={() => goToPage(pageIndex - 1)}
              disabled={pageIndex <= 1 || loading}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="page active">{pageIndex}</button>
            <button
              className="page"
              onClick={() => goToPage(pageIndex + 1)}
              disabled={filteredPatients.length < pageSize || loading}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <select
              className="select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ width: 'auto', padding: '4px 8px', height: 'auto' }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QueuePanel;