import React, { useState } from 'react';
import { usePatientVisits } from '../../../hook/usePatientVisits';
import type { LuotKhamItemDto } from '../../../type/visit.patient.type';
import './VisitsTab.css';

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
      <div className="visits-loading">
        <i className="fas fa-spinner fa-spin"></i> Đang tải lịch sử khám...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="visits-empty">
        <i className="fas fa-notes-medical"></i>
        <p>Bệnh nhân chưa có lượt khám nào</p>
      </div>
    );
  }

  return (
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
  );
};

export default VisitsTab;