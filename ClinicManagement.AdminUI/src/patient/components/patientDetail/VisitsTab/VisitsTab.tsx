import React, { useState } from 'react';
import { usePatientVisits } from '../../../hook/usePatientVisits';
import type { LuotKhamItemDto } from '../../../type/visit.patient.type';

const visitsTabStyles = `
.visits-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.visits-tab .tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.visits-tab .tab-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.visits-tab .tab-header .edit-btn {
  padding: 6px 16px;
  border: 1px solid #2c7da0;
  background: #fff;
  color: #2c7da0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.visits-tab .tab-header .edit-btn:hover {
  background: #2c7da0;
  color: #fff;
}

.visits-tab .card {
  background: #fefefe;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 0;
}

.visits-tab .table-wrap {
  overflow-x: auto;
}

.visits-tab table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.visits-tab th {
  text-align: left;
  padding: 8px 8px 8px 0;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}

.visits-tab td {
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: middle;
}

.visits-tab .tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.visits-tab .tag-success {
  background: #d4efdf;
  color: #1e8449;
}

.visits-tab .tag-danger {
  background: #fdedec;
  color: #c0392b;
}

.visits-tab .tag-primary {
  background: #d6eaf8;
  color: #21618c;
}

.visits-tab .tag-warning {
  background: #fef9e7;
  color: #b7950b;
}

.visits-tab .tag-default {
  background: #f1f5f9;
  color: #475569;
}

.visits-tab .small-btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.visits-tab .small-btn:hover {
  background: #f1f5f9;
}

/* Pagination */
.visits-tab .pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 0 0;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.visits-tab .pagination .info {
  font-size: 12px;
  color: #64748b;
}

.visits-tab .pagination .info strong {
  color: #0f172a;
}

.visits-tab .pagination .pages {
  display: flex;
  gap: 3px;
}

.visits-tab .pagination .pages button {
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.1s;
  font-family: inherit;
  color: #0f172a;
}

.visits-tab .pagination .pages button:hover {
  background: #f1f5f9;
}

.visits-tab .pagination .pages button.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.visits-tab .pagination .pages button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Loading & Empty states */
.visits-loading,
.visits-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #7f8c8d;
  gap: 12px;
}

.visits-loading i,
.visits-empty i {
  font-size: 32px;
  color: #cbd5e1;
}

.visits-loading i.fa-spinner {
  color: #2c7da0;
}

.visits-empty p {
  font-size: 14px;
  margin: 0;
}
`;

interface VisitsTabProps {
  patientId: number;
}

const VisitsTab: React.FC<VisitsTabProps> = ({ patientId }) => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  const { items, loading, totalCount, totalPages, hasNextPage, hasPreviousPage, refetch } =
    usePatientVisits({
      patientId,
      pageIndex,
      pageSize,
    });

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      'CHO_KHAM': { label: 'Chờ khám', color: 'warning' },
      'DANG_KHAM': { label: 'Đang khám', color: 'processing' },
      'DA_KHAM': { label: 'Đã khám', color: 'blue' },
      'KET_LUAN': { label: 'Kết luận', color: 'cyan' },
      'HOAN_THANH': { label: 'Hoàn thành', color: 'success' },
      'DA_HUY': { label: 'Đã hủy', color: 'default' },
    };
    return map[status] || { label: status, color: 'default' };
  };

  // Helper: format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getTagClass = (type: string) => {
    const map: Record<string, string> = {
      'success': 'tag-success',
      'danger': 'tag-danger',
      'primary': 'tag-primary',
      'warning': 'tag-warning',
      'processing': 'tag-primary',
      'default': 'tag-default',
      'blue': 'tag-primary',
      'cyan': 'tag-primary',
    };
    return map[type] || 'tag-primary';
  };

  // Go to page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPageIndex(page);
    }
  };

  if (loading) {
    return (
      <>
        <style>{visitsTabStyles}</style>
        <div className="visits-loading">
          <i className="fas fa-spinner fa-spin"></i> Đang tải lịch sử khám...
        </div>
      </>
    );
  }

  if (!items || items.length === 0) {
    return (
      <>
        <style>{visitsTabStyles}</style>
        <div className="visits-empty">
          <i className="fas fa-notes-medical"></i>
          <p>Bệnh nhân chưa có lượt khám nào</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{visitsTabStyles}</style>
      <div className="visits-tab">
        <div className="tab-header">
          <h2>Lịch sử khám</h2>
          <button className="edit-btn" onClick={() => refetch()}>
            <i className="fas fa-sync"></i> Làm mới
          </button>
        </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ngày giờ</th>
                <th>Khoa</th>
                <th>Bác sĩ</th>
                <th>Hình thức</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((visit) => {
                const statusInfo = getStatusInfo(visit.trangThai);
                return (
                  <tr key={visit.id}>
                    <td>{formatDate(visit.ngayKham)}</td>
                    <td><strong>{visit.khoa}</strong></td>
                    <td>{visit.bacSi}</td>
                    <td>{visit.hinhThucDieuTri === 'NGOAI_TRU' ? 'Ngoại trú' : 'Nội trú'}</td>
                    <td>{visit.lyDoKham || '--'}</td>
                    <td>
                      <span className={`tag ${getTagClass(statusInfo.color)}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="small-btn"
                        onClick={() => alert(`Chi tiết lượt khám ${visit.id}`)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="info">
              Hiển thị <strong>{items.length}</strong> trên <strong>{totalCount}</strong> lượt khám
            </div>
            <div className="pages">
              <button
                onClick={() => goToPage(pageIndex - 1)}
                disabled={!hasPreviousPage}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pageIndex <= 3) {
                  pageNum = i + 1;
                } else if (pageIndex >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pageIndex - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={pageNum === pageIndex ? 'active' : ''}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(pageIndex + 1)}
                disabled={!hasNextPage}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);
};

export default VisitsTab;