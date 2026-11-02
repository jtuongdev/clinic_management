import React, { useState } from 'react';
import {
  Drawer,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Popconfirm,
  Input,
  Tooltip,
  Modal,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  PrinterOutlined,
  WarningOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  ImportReceiptDto,
  ImportReceiptLineDto,
  ImportReceiptStatus,
} from '../types/inventory.types';

const { Text, Title } = Typography;

export interface ImportReceiptDetailDrawerProps {
  open: boolean;
  receipt: ImportReceiptDto | null;
  onClose: () => void;
  onApprove?: (id: number) => Promise<void> | void;
  onCancelReceipt?: (id: number, reason: string) => Promise<void> | void;
  onEdit?: (receipt: ImportReceiptDto) => void;
  approving?: boolean;
  canceling?: boolean;
}

const statusBadgeConfig: Record<
  ImportReceiptStatus,
  { color: string; bg: string; text: string; border: string }
> = {
  CHO_DUYET: {
    color: '#713F12',
    bg: '#FEFCE8',
    text: 'Chờ duyệt',
    border: '#EAB308',
  },
  DA_NHAP: {
    color: '#14532D',
    bg: '#F0FDF4',
    text: 'Đã nhập',
    border: '#86EFAC',
  },
  DA_HUY: {
    color: '#374151',
    bg: '#F3F4F6',
    text: 'Đã hủy',
    border: '#D1D5DB',
  },
  TAM: {
    color: '#0369a1',
    bg: '#f0f9ff',
    text: 'Nháp tạm',
    border: '#bae6fd',
  },
};

export const ImportReceiptDetailDrawer: React.FC<ImportReceiptDetailDrawerProps> = ({
  open,
  receipt,
  onClose,
  onApprove,
  onCancelReceipt,
  onEdit,
  approving = false,
  canceling = false,
}) => {
  const [cancelReason, setCancelReason] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);

  if (!receipt) return null;

  const formatCurrency = (amount: number) =>
    (amount ?? 0).toLocaleString('vi-VN') + ' ₫';

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusCfg = statusBadgeConfig[receipt.status] ?? {
    color: '#374151',
    bg: '#f3f4f6',
    text: receipt.status,
    border: '#e5e7eb',
  };

  // Cột bảng danh sách thuốc chi tiết
  const lineColumns: ColumnsType<ImportReceiptLineDto> = [
    {
      title: 'STT',
      key: 'index',
      width: 45,
      align: 'center',
      render: (_, __, i) => <span style={{ color: '#64748b', fontSize: 11.5 }}>{i + 1}</span>,
    },
    {
      title: 'Mã thuốc / VTYT',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 95,
      render: (code: string) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 11,
            color: '#0369a1',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: '1px 5px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'Tên thuốc / Hoạt chất',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name: string, row) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 12,
              color: '#0f172a',
              lineHeight: 1.3,
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>
            Phân loại: {row.itemType === 'THUOC' ? 'Thuốc tân dược' : 'Vật tư y tế'}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lô (Batch)',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 95,
      render: (batch: string) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: 11,
            color: '#1e293b',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            padding: '1px 5px',
            borderRadius: 3,
          }}
        >
          {batch || '--'}
        </span>
      ),
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 105,
      render: (dateStr?: string | null) => {
        if (!dateStr) return <span style={{ color: '#94a3b8', fontSize: 11 }}>--</span>;
        const exp = new Date(dateStr);
        const diffDays = (exp.getTime() - Date.now()) / (1000 * 3600 * 24);
        const isExpired = diffDays <= 0;
        const isExpiringSoon = !isExpired && diffDays <= 90;

        return (
          <div style={{ lineHeight: 1.2 }}>
            <span
              style={{
                fontWeight: isExpired || isExpiringSoon ? 700 : 500,
                fontSize: 11,
                color: isExpired
                  ? '#dc2626'
                  : isExpiringSoon
                    ? '#d97706'
                    : '#334155',
              }}
            >
              {new Date(dateStr).toLocaleDateString('vi-VN')}
            </span>
            {isExpired && (
              <div>
                <Tag
                  color="red"
                  icon={<WarningOutlined />}
                  style={{ fontSize: 9, padding: '0 3px', margin: 0, lineHeight: '13px' }}
                >
                  Hết hạn
                </Tag>
              </div>
            )}
            {isExpiringSoon && (
              <div>
                <Tag
                  color="warning"
                  icon={<WarningOutlined />}
                  style={{ fontSize: 9, padding: '0 3px', margin: 0, lineHeight: '13px' }}
                >
                  Còn {Math.round(diffDays)} ngày
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'baseUnit',
      key: 'baseUnit',
      width: 65,
      align: 'center',
      render: (u: string) => (
        <span style={{ fontSize: 11, color: '#475569' }}>{u || 'Viên'}</span>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'right',
      render: (qty: number) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            fontSize: 12,
            color: '#0f172a',
          }}
        >
          {qty.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Đơn giá nhập',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: 100,
      align: 'right',
      render: (price: number) => (
        <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', fontSize: 11.5, color: '#334155' }}>
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'lineAmount',
      key: 'lineAmount',
      width: 115,
      align: 'right',
      render: (amount: number) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            fontSize: 12,
            color: '#0f172a',
          }}
        >
          {formatCurrency(amount)}
        </span>
      ),
    },
  ];

  const totalQuantity = (receipt.lines || []).reduce(
    (acc, l) => acc + (l.quantity || 0),
    0,
  );

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>
              Phiếu nhập kho #{receipt.id}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11.5,
                fontWeight: 600,
                color: statusCfg.color,
                background: statusCfg.bg,
                border: `1px solid ${statusCfg.border}`,
              }}
            >
              {statusCfg.text}
            </span>
          </div>
        }
        placement="right"
        width={isFullScreen ? '100vw' : 650}
        styles={{
          body: {
            padding: '10px 14px',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          },
        }}
        onClose={onClose}
        open={open}
        extra={
          <Space size="small">
            <Tooltip title="In biểu mẫu phiếu nhập kho A4">
              <Button
                size="small"
                icon={<PrinterOutlined />}
                onClick={() => setPrintModalVisible(true)}
                style={{ fontSize: 12 }}
              >
                In phiếu nhập A4
              </Button>
            </Tooltip>

            {receipt.status === 'CHO_DUYET' && (
              <>
                {onEdit && (
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      onEdit(receipt);
                      onClose();
                    }}
                    style={{ fontSize: 12 }}
                  >
                    Sửa nháp
                  </Button>
                )}

                {onCancelReceipt && (
                  <Popconfirm
                    title="Xác nhận hủy phiếu nhập"
                    description={
                      <div style={{ marginTop: 8 }}>
                        <p style={{ marginBottom: 4, fontSize: 12 }}>Nhập lý do hủy phiếu nháp này:</p>
                        <Input
                          size="small"
                          placeholder="Lý do hủy..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                      </div>
                    }
                    onConfirm={() => {
                      void onCancelReceipt(receipt.id, cancelReason);
                      setCancelReason('');
                    }}
                    okText="Hủy phiếu"
                    cancelText="Đóng"
                    okButtonProps={{ danger: true, loading: canceling }}
                  >
                    <Button 
                      size="small" 
                      danger 
                      icon={<CloseCircleOutlined />} 
                      loading={canceling}
                      style={{ fontSize: 12 }}
                    >
                      Từ chối / Hủy
                    </Button>
                  </Popconfirm>
                )}

                {onApprove && (
                  <Popconfirm
                    title="Duyệt nhập kho y tế (GPP)"
                    description={`Bạn có chắc muốn duyệt phiếu #${receipt.id} và cập nhật tồn kho chính thức?`}
                    onConfirm={() => void onApprove(receipt.id)}
                    okText="Duyệt ngay"
                    cancelText="Bỏ qua"
                    okButtonProps={{ loading: approving }}
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      loading={approving}
                      style={{ 
                        background: '#166534', 
                        borderColor: '#166534', 
                        fontSize: 12 
                      }}
                    >
                      Duyệt phiếu
                    </Button>
                  </Popconfirm>
                )}
              </>
            )}

            <Tooltip title={isFullScreen ? 'Thu nhỏ giao diện (680px)' : 'Phóng to toàn màn hình'}>
              <Button
                size="small"
                icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setIsFullScreen(!isFullScreen)}
              />
            </Tooltip>
          </Space>
        }
      >
        {/* Thông tin chung */}
        <div
          style={{
            background: '#ffffff',
            padding: '10px 12px',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
            Thông tin hành chính & chứng từ
          </div>
          <Descriptions
            bordered
            size="small"
            column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            labelStyle={{ fontWeight: 600, color: '#475569', fontSize: 11.5, width: '110px', padding: '4px 6px', background: '#f8fafc' }}
            contentStyle={{ fontSize: 12, padding: '4px 6px', color: '#1e293b' }}
          >
            <Descriptions.Item label="Mã phiếu">
              <span style={{ color: '#0369a1', fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }}>
                #{receipt.id}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Số HĐ / Chứng từ">
              <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, color: '#0f172a' }}>
                {receipt.referenceCode || '--'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày nhập kho">
              <span style={{ fontSize: 12 }}>{formatDate(receipt.receivedAt)}</span>
            </Descriptions.Item>

            <Descriptions.Item label="Kho tiếp nhận">
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 12 }}>
                {receipt.warehouse?.name || 'Kho Dược chính'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Người lập phiếu">
              <span style={{ fontSize: 12 }}>{receipt.receivedBy?.name || 'Nhân viên Dược'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Cơ sở y tế">
              <span style={{ fontSize: 12 }}>{receipt.facility?.name || 'Bệnh viện Đa khoa'}</span>
            </Descriptions.Item>

            <Descriptions.Item label="Nhà cung cấp" span={isFullScreen ? 2 : 1}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 12 }}>
                {receipt.supplier?.name || '--'}
                {receipt.supplier?.code && (
                  <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4, fontWeight: 400 }}>
                    ({receipt.supplier.code})
                  </span>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Điện thoại NCC">
              <span style={{ fontSize: 12 }}>{receipt.supplier?.phone || '--'}</span>
            </Descriptions.Item>

            <Descriptions.Item label="Ghi chú" span={isFullScreen ? 3 : 2}>
              <span style={{ fontSize: 11.5, color: receipt.note ? '#334155' : '#94a3b8', fontStyle: receipt.note ? 'normal' : 'italic' }}>
                {receipt.note || 'Không có ghi chú thêm'}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Bảng chi tiết thuốc */}
        <div
          style={{
            background: '#ffffff',
            padding: '10px 12px',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
              Danh mục thuốc & vật tư ({receipt.lines?.length || 0} khoản)
            </span>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>
              Tổng số lượng đơn vị: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{totalQuantity.toLocaleString('vi-VN')}</strong>
            </span>
          </div>

          <Table<ImportReceiptLineDto>
            className="drawer-detail-table"
            rowKey="id"
            columns={lineColumns}
            dataSource={receipt.lines || []}
            pagination={false}
            size="small"
            bordered
            locale={{
              emptyText: 'Không có mặt hàng nào trong phiếu này.',
            }}
          />
        </div>

        {/* Banner tổng kết tài chính */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            padding: '8px 14px',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#334155' }}>
              Kho: <strong>{receipt.warehouse?.name || 'Kho Dược chính'}</strong> • Tổng: <strong>{receipt.lines?.length || 0}</strong> dòng mặt hàng
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              Trạng thái: <strong>{statusCfg.text}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              TỔNG GIÁ TRỊ NHẬP KHO:
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontVariantNumeric: 'tabular-nums',
                fontSize: 16,
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              {formatCurrency(receipt.totalAmount)}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal xem trước và in phiếu nhập A4 chuẩn GPP */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PrinterOutlined style={{ color: '#0284c7' }} />
            <span>Xem trước bản in A4 - Phiếu nhập kho #{receipt.id}</span>
          </div>
        }
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        width={820}
        footer={[
          <Button key="close" onClick={() => setPrintModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
          >
            In phiếu (Ctrl + P)
          </Button>,
        ]}
      >
        <div
          style={{
            padding: '24px 28px',
            background: '#fff',
            color: '#1e293b',
            fontFamily: 'Arial, sans-serif',
            fontSize: 13,
            lineHeight: 1.5,
            border: '1px solid #cbd5e1',
            borderRadius: 2,
          }}
        >
          {/* Header A4 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase' }}>
                {receipt.facility?.name || 'BỆNH VIỆN ĐA KHOA QUỐC TẾ'}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                KHOA DƯỢC - {receipt.warehouse?.name || 'KHO CHÍNH'}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#475569' }}>
              <div>Mẫu số: <strong>01 - VT/GPP</strong></div>
              <div>Ban hành theo TT 22/2011/TT-BYT</div>
              <div>Số phiếu: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>#{receipt.id}</strong></div>
            </div>
          </div>

          {/* Tiêu đề phiếu */}
          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              PHIẾU NHẬP KHO THUỐC & VẬT TƯ Y TẾ
            </h2>
            <div style={{ fontSize: 12, fontStyle: 'italic', color: '#475569', marginTop: 3 }}>
              Ngày {new Date(receipt.receivedAt || Date.now()).getDate()} tháng {new Date(receipt.receivedAt || Date.now()).getMonth() + 1} năm {new Date(receipt.receivedAt || Date.now()).getFullYear()}
            </div>
          </div>

          {/* Thông tin chứng từ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', marginBottom: 14, fontSize: 12.5 }}>
            <div>Đơn vị giao hàng / NCC: <strong>{receipt.supplier?.name || '--'}</strong></div>
            <div>Số HĐ / Chứng từ gốc: <strong style={{ fontFamily: 'monospace' }}>{receipt.referenceCode || '--'}</strong></div>
            <div>Địa chỉ NCC: <span>{receipt.supplier?.address || '--'}</span></div>
            <div>Nhập tại kho: <strong>{receipt.warehouse?.name || 'Kho Dược chính'}</strong></div>
            <div>Người lập phiếu: <span>{receipt.receivedBy?.name || 'Nhân viên Dược'}</span></div>
            <div>Trạng thái: <strong>{statusCfg.text}</strong></div>
            {receipt.note && (
              <div style={{ gridColumn: 'span 2' }}>Ghi chú: <em>{receipt.note}</em></div>
            )}
          </div>

          {/* Bảng chi tiết in */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: 14,
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderTop: '1px solid #334155', borderBottom: '1px solid #334155' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: 40 }}>STT</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left', width: 90 }}>Mã thuốc</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Tên thuốc, hàm lượng, quy cách</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: 85 }}>Số lô</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: 85 }}>Hạn dùng</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: 60 }}>ĐVT</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: 70 }}>Số lượng</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: 90 }}>Đơn giá</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: 105 }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {(receipt.lines || []).map((l, idx) => (
                <tr key={l.id || idx}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{l.itemCode}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px' }}>
                    <div style={{ fontWeight: 600 }}>{l.itemName}</div>
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace' }}>{l.batchNumber || '--'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>
                    {l.expiryDate ? new Date(l.expiryDate).toLocaleDateString('vi-VN') : '--'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{l.baseUnit || 'Viên'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    {l.quantity?.toLocaleString('vi-VN')}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatCurrency(l.purchasePrice)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatCurrency(l.lineAmount)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>
                  Cộng tổng cộng:
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                  {totalQuantity.toLocaleString('vi-VN')}
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }} />
                <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>
                  {formatCurrency(receipt.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Chữ ký 4 bên */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', marginTop: 24, fontSize: 12 }}>
            <div>
              <strong>Người lập phiếu</strong>
              <div style={{ fontSize: 11, fontStyle: 'italic', color: '#64748b' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: 60 }} />
              <div>{receipt.receivedBy?.name || 'Nhân viên Dược'}</div>
            </div>
            <div>
              <strong>Người giao hàng</strong>
              <div style={{ fontSize: 11, fontStyle: 'italic', color: '#64748b' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: 60 }} />
              <div>{receipt.supplier?.name || 'Đại diện bên giao'}</div>
            </div>
            <div>
              <strong>Thủ kho nhận</strong>
              <div style={{ fontSize: 11, fontStyle: 'italic', color: '#64748b' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: 60 }} />
              <div>Thủ kho Dược</div>
            </div>
            <div>
              <strong>Phụ trách chuyên môn</strong>
              <div style={{ fontSize: 11, fontStyle: 'italic', color: '#64748b' }}>(Ký, đóng dấu)</div>
              <div style={{ height: 60 }} />
              <div>Trưởng khoa Dược</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImportReceiptDetailDrawer;
