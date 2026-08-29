import React, { useState } from 'react';
import { usePatientInvoices } from '../../hook/usePatientInvoices';
import type { HoaDonItemDto } from '../../type/invoice.patient.type';
import './BillingTab.css';

interface BillingTabProps {
  patientId: number;
}

const BillingTab: React.FC<BillingTabProps> = ({ patientId }) => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  const { items, loading, totalCount, totalPages, hasNextPage, hasPreviousPage, refetch } =
    usePatientInvoices({
      patientId,
      pageIndex,
      pageSize,
    });

  // Helper: format currency
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Helper: format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  // Helper: get status info
  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      'PENDING': { label: 'Chờ thanh toán', color: 'warning' },
      'PARTIAL': { label: 'Thanh toán một phần', color: 'primary' },
      'PAID': { label: 'Đã thanh toán', color: 'success' },
      'CANCELLED': { label: 'Đã hủy', color: 'default' },
    };
    return map[status] || { label: status, color: 'default' };
  };

  const getTagClass = (type: string) => {
    const map: Record<string, string> = {
      'success': 'tag-success',
      'danger': 'tag-danger',
      'primary': 'tag-primary',
      'warning': 'tag-warning',
      'default': 'tag-default',
    };
    return map[type] || 'tag-default';
  };

  // Go to page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPageIndex(page);
    }
  };

  if (loading) {
    return (
      <div className="billing-loading">
        <i className="fas fa-spinner fa-spin"></i> Đang tải hóa đơn...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="billing-empty">
        <i className="fas fa-file-invoice"></i>
        <p>Bệnh nhân chưa có hóa đơn nào</p>
      </div>
    );
  }

  return (
    <div className="billing-tab">
      <div className="tab-header">
        <h2>Lịch sử hóa đơn</h2>
        <button className="edit-btn" onClick={() => refetch()}>
          <i className="fas fa-sync"></i> Làm mới
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Ngày lập</th>
                <th>Tổng tiền</th>
                <th>Đã thanh toán</th>
                <th>Công nợ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((invoice) => {
                const statusInfo = getStatusInfo(invoice.trangThai);
                const conNo = invoice.tongTien - invoice.daThanhToan;
                return (
                  <tr key={invoice.id}>
                    <td><strong>{invoice.soHoaDon}</strong></td>
                    <td>{formatDate(invoice.ngayLap)}</td>
                    <td><strong>{formatCurrency(invoice.tongTien)}</strong></td>
                    <td>{formatCurrency(invoice.daThanhToan)}</td>
                    <td style={{ color: conNo > 0 ? '#c0392b' : '#27ae60' }}>
                      {formatCurrency(conNo)}
                    </td>
                    <td>
                      <span className={`tag ${getTagClass(statusInfo.color)}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="small-btn"
                        onClick={() => alert(`Chi tiết hóa đơn ${invoice.soHoaDon}`)}
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
              Hiển thị <strong>{items.length}</strong> trên <strong>{totalCount}</strong> hóa đơn
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

export default BillingTab;