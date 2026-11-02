import React, { useState } from 'react';
import { usePatientInvoices } from '../../hook/usePatientInvoices';
import type { HoaDonItemDto } from '../../type/invoice.patient.type';

const billingTabStyles = `
/* ===== Billing Tab ===== */
.billing-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.billing-tab .tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.billing-tab .tab-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.billing-tab .tab-header .edit-btn {
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

.billing-tab .tab-header .edit-btn:hover {
  background: #2c7da0;
  color: #fff;
}

.billing-tab .card {
  background: #fefefe;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 0;
}

.billing-tab .table-wrap {
  overflow-x: auto;
}

.billing-tab table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.billing-tab th {
  text-align: left;
  padding: 8px 8px 8px 0;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}

.billing-tab td {
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: middle;
}

.billing-tab .tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.billing-tab .tag-success {
  background: #d4efdf;
  color: #1e8449;
}

.billing-tab .tag-danger {
  background: #fdedec;
  color: #c0392b;
}

.billing-tab .tag-primary {
  background: #d6eaf8;
  color: #21618c;
}

.billing-tab .tag-warning {
  background: #fef9e7;
  color: #b7950b;
}

.billing-tab .tag-default {
  background: #f1f5f9;
  color: #475569;
}

.billing-tab .small-btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.billing-tab .small-btn:hover {
  background: #f1f5f9;
}

/* Pagination */
.billing-tab .pagination {
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

.billing-tab .pagination .info {
  font-size: 12px;
  color: #64748b;
}

.billing-tab .pagination .info strong {
  color: #0f172a;
}

.billing-tab .pagination .pages {
  display: flex;
  gap: 3px;
}

.billing-tab .pagination .pages button {
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

.billing-tab .pagination .pages button:hover {
  background: #f1f5f9;
}

.billing-tab .pagination .pages button.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.billing-tab .pagination .pages button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Loading & Empty states */
.billing-loading,
.billing-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #7f8c8d;
  gap: 12px;
}

.billing-loading i,
.billing-empty i {
  font-size: 32px;
  color: #cbd5e1;
}

.billing-loading i.fa-spinner {
  color: #2c7da0;
}

.billing-empty p {
  font-size: 14px;
  margin: 0;
}
`;

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
      <>
        <style>{billingTabStyles}</style>
        <div className="billing-loading">
          <i className="fas fa-spinner fa-spin"></i> Đang tải hóa đơn...
        </div>
      </>
    );
  }

  if (!items || items.length === 0) {
    return (
      <>
        <style>{billingTabStyles}</style>
        <div className="billing-empty">
          <i className="fas fa-file-invoice"></i>
          <p>Bệnh nhân chưa có hóa đơn nào</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{billingTabStyles}</style>
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
  </>
);
};

export default BillingTab;