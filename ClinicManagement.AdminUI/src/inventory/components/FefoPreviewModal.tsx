import React, { useEffect, useState } from 'react';
import {
  Modal,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Alert,
  Spin,
  Card,
  Descriptions,
  Divider,
} from 'antd';
import {
  MedicineBoxOutlined,
  CheckOutlined,
  CloseOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FefoPreviewResult, FefoItemPreview } from '../types/inventory.types';
import { inventoryApi } from '../api/inventory.api';

const { Text } = Typography;

interface FefoPreviewModalProps {
  open: boolean;
  prescriptionId: number | null;
  onConfirmDispense: (prescriptionId: number) => Promise<void>;
  onCancel: () => void;
  confirming?: boolean;
}

const formatDate = (isoString?: string | null) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const FefoPreviewModal: React.FC<FefoPreviewModalProps> = ({
  open,
  prescriptionId,
  onConfirmDispense,
  onCancel,
  confirming = false,
}) => {
  const [data, setData] = useState<FefoPreviewResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !prescriptionId) {
      setData(null);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    inventoryApi
      .previewFefo(prescriptionId)
      .then((res) => {
        if (isMounted) {
          if (res.data.success && res.data.data) {
            setData(res.data.data);
          } else {
            setErrorMsg(res.data.message || 'Không thể tải bảng xem trước phân bổ FEFO');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMsg(err.response?.data?.message || 'Lỗi khi gọi API phân bổ FEFO');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, prescriptionId]);

  const columns: ColumnsType<FefoItemPreview> = [
    {
      title: 'Thuốc / Vật tư',
      key: 'item',
      render: (_, record) => (
        <div>
          <Text strong style={{ color: '#0b4f6c' }}>
            {record.itemName}
          </Text>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Mã: {record.itemCode}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng kê',
      key: 'prescribedQuantity',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <Text strong>
          {record.prescribedQuantity} {record.baseUnit}
        </Text>
      ),
    },
    {
      title: 'Tồn khả dụng',
      key: 'totalAvailableStock',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Text>{record.totalAvailableStock} {record.baseUnit}</Text>
          {record.isSufficient ? (
            <Tag color="success">Đủ hàng</Tag>
          ) : (
            <Tag color="error">Thiếu</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Phân bổ Lô theo FEFO (Hạn dùng gần nhất xuất trước)',
      key: 'allocations',
      render: (_, record) => {
        if (!record.allocations || record.allocations.length === 0) {
          return <Text type="danger">Không có lô khả dụng còn hạn</Text>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {record.allocations.map((alloc) => (
              <div
                key={alloc.stockId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                }}
              >
                <Space>
                  <Tag color="blue" style={{ fontWeight: 600 }}>
                    Lô: {alloc.batchNumber}
                  </Tag>
                  <span style={{ color: '#475569' }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    HSD: <strong>{formatDate(alloc.expiryDate)}</strong>
                  </span>
                </Space>
                <div>
                  <span style={{ color: '#0b4f6c', fontWeight: 600 }}>
                    Xuất: {alloc.quantityToTake} {record.baseUnit}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>
                    (Còn lại sau xuất: {alloc.availableAfter})
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <MedicineBoxOutlined style={{ color: '#0b4f6c', fontSize: 18 }} />
          <span>Xem trước phân bổ lô thuốc (FEFO Preview)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={onCancel}>
          Đóng
        </Button>,
        <Button
          key="confirm"
          type="primary"
          icon={<CheckOutlined />}
          loading={confirming}
          disabled={!data || !data.canDispense || !data.allAvailable}
          onClick={() => prescriptionId && onConfirmDispense(prescriptionId)}
        >
          Xác nhận cấp phát & Trừ kho
        </Button>,
      ]}
      destroyOnHidden
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" tip="Đang tính toán phân bổ lô theo FEFO..." />
        </div>
      ) : errorMsg ? (
        <Alert
          type="error"
          showIcon
          message="Không thể xem trước phân bổ FEFO"
          description={errorMsg}
          style={{ marginBottom: 16 }}
        />
      ) : data ? (
        <div>
          {/* Thông tin đơn thuốc & Viện phí */}
          <Card size="small" style={{ marginBottom: 16, background: '#f8fafc' }}>
            <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }}>
              <Descriptions.Item label="Mã đơn thuốc">
                <Text strong style={{ color: '#0b4f6c' }}>
                  {data.prescriptionCode}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Bệnh nhân">
                <Text strong>{data.patientName}</Text>
                {data.patientCode && (
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    ({data.patientCode})
                  </Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ kê đơn">
                {data.doctorName || '--'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái Viện phí">
                {data.isPaid ? (
                  <Tag color="success" style={{ fontWeight: 600 }}>
                    ● ĐÃ THANH TOÁN
                  </Tag>
                ) : (
                  <Tag color="warning" style={{ fontWeight: 600 }}>
                    ● CHƯA THANH TOÁN
                  </Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Cảnh báo nếu chưa thanh toán hoặc thiếu kho */}
          {data.requirePayment && !data.isPaid && (
            <Alert
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              message="Đơn thuốc chưa được thanh toán tại quầy viện phí"
              description="Theo quy định của phòng khám (RequirePaymentBeforeDispense = Bật), bệnh nhân cần hoàn tất đóng viện phí trước khi quầy dược tiến hành cấp phát thuốc."
              style={{ marginBottom: 16 }}
            />
          )}

          {!data.allAvailable && (
            <Alert
              type="error"
              showIcon
              message="Tồn kho khả dụng không đủ"
              description="Có một hoặc nhiều mặt hàng trong đơn không đủ số lượng tồn kho còn hạn. Hệ thống không cho phép xuất kho khi chưa đủ hàng."
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider orientation="left" style={{ margin: '12px 0', fontSize: 14 }}>
            Chi tiết các lô thuốc xuất kho theo nguyên tắc FEFO
          </Divider>

          <Table<FefoItemPreview>
            rowKey="itemId"
            columns={columns}
            dataSource={data.items}
            pagination={false}
            size="middle"
            bordered
          />
        </div>
      ) : null}
    </Modal>
  );
};

export default FefoPreviewModal;
