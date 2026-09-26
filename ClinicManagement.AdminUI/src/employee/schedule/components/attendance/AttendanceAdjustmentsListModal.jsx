import { Button, Modal, Table, Tag } from 'antd';
import { FileText } from 'lucide-react';
import dayjs from 'dayjs';

export const AttendanceAdjustmentsListModal = ({
  open,
  adjustments = [],
  employees = [],
  pendingCount = 0,
  onClose,
  onReview,
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={18} style={{ color: '#0284c7' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            DANH SÁCH ĐƠN DUYỆT ĐIỀU CHỈNH CHẤM CÔNG (EXCEL DATA GRID)
          </span>
        </div>
      }
      open={open}
      footer={null}
      onCancel={onClose}
      width="94vw"
      style={{ maxWidth: 1400 }}
    >
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          Tổng số: <strong>{adjustments.length}</strong> đơn yêu cầu • Chờ duyệt:{' '}
          <strong style={{ color: '#d97706' }}>{pendingCount}</strong>
        </span>
      </div>

      <Table
        rowKey="id"
        size="small"
        dataSource={adjustments}
        className="excel-data-grid"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        locale={{ emptyText: 'Chưa có yêu cầu điều chỉnh chấm công nào.' }}
        columns={[
          {
            title: 'STT',
            width: 50,
            align: 'center',
            className: 'excel-stt-cell',
            render: (_, __, idx) => idx + 1,
          },
          {
            title: 'Mã CC',
            dataIndex: 'maChamCong',
            width: 80,
            align: 'center',
            className: 'excel-num-cell',
            render: (v) => <span style={{ fontWeight: 600 }}>#{v}</span>,
          },
          {
            title: 'Nhân viên',
            width: 180,
            render: (_, item) => {
              const emp = employees.find((e) => e.id === item.maNhanVien);
              return (
                <div>
                  <strong style={{ color: '#0f172a' }}>{emp?.hoTen || emp?.name || `NV #${item.maNhanVien}`}</strong>
                  {emp?.chuyenKhoa && <div style={{ fontSize: 11, color: '#64748b' }}>{emp.chuyenKhoa}</div>}
                </div>
              );
            },
          },
          {
            title: 'Giờ vào cũ',
            dataIndex: 'checkInCu',
            width: 110,
            align: 'center',
            className: 'excel-date-cell',
            render: (v) => (v ? <span style={{ color: '#64748b' }}>{dayjs(v).format('HH:mm DD/MM')}</span> : '-'),
          },
          {
            title: 'Giờ ra cũ',
            dataIndex: 'checkOutCu',
            width: 110,
            align: 'center',
            className: 'excel-date-cell',
            render: (v) => (v ? <span style={{ color: '#64748b' }}>{dayjs(v).format('HH:mm DD/MM')}</span> : '-'),
          },
          {
            title: 'Check-in mới (Đề xuất)',
            dataIndex: 'checkInMoi',
            width: 140,
            align: 'center',
            className: 'excel-date-cell',
            render: (v) =>
              v ? (
                <strong style={{ color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>
                  {dayjs(v).format('HH:mm DD/MM/YYYY')}
                </strong>
              ) : (
                '-'
              ),
          },
          {
            title: 'Check-out mới (Đề xuất)',
            dataIndex: 'checkOutMoi',
            width: 140,
            align: 'center',
            className: 'excel-date-cell',
            render: (v) =>
              v ? (
                <strong style={{ color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>
                  {dayjs(v).format('HH:mm DD/MM/YYYY')}
                </strong>
              ) : (
                '-'
              ),
          },
          {
            title: 'Lý do điều chỉnh',
            dataIndex: 'lyDo',
            render: (v) => <span style={{ color: '#334155' }}>{v}</span>,
          },
          {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            width: 115,
            align: 'center',
            render: (v) => {
              const styles = {
                DA_DUYET: { background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' },
                TU_CHOI: { background: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' },
                CHO_DUYET: { background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
              };
              return (
                <Tag style={{ ...(styles[v] || { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }), fontWeight: 600, fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                  {v === 'DA_DUYET' ? 'Đã duyệt' : v === 'TU_CHOI' ? 'Từ chối' : 'Chờ duyệt'}
                </Tag>
              );
            },
          },
          {
            title: 'Thao tác',
            width: 150,
            align: 'center',
            render: (_, item) =>
              item.trangThai === 'CHO_DUYET' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Button
                    size="small"
                    type="primary"
                    style={{ background: '#059669', borderColor: '#059669', fontSize: 11, padding: '0 8px', height: 24 }}
                    onClick={() => onReview(item.id, true)}
                  >
                    Duyệt
                  </Button>
                  <Button
                    size="small"
                    danger
                    style={{ fontSize: 11, padding: '0 8px', height: 24 }}
                    onClick={() => onReview(item.id, false)}
                  >
                    Từ chối
                  </Button>
                </div>
              ) : (
                <span style={{ color: '#94a3b8', fontSize: 11 }}>Đã xử lý</span>
              ),
          },
        ]}
      />
    </Modal>
  );
};
