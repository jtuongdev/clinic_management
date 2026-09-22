import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Tooltip,
  App,
} from 'antd';
import {
  MedicineBoxOutlined,
  CheckOutlined,
  ReloadOutlined,
  PrinterOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  PendingPrescriptionDto,
  DispenseResult,
  PrescriptionPrintDto,
} from '../types/inventory.types';
import { inventoryApi } from '../api/inventory.api';
import PrescriptionPrintModal from './PrescriptionPrintModal';
import FefoPreviewModal from './FefoPreviewModal';

const { Text } = Typography;

interface DispensePanelProps {
  onDispenseSuccess?: (result: DispenseResult) => void;
}

const DispensePanel: React.FC<DispensePanelProps> = ({ onDispenseSuccess }) => {
  const { message } = App.useApp();

  const [prescriptions, setPrescriptions] = useState<PendingPrescriptionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [dispensingId, setDispensingId] = useState<number | null>(null);

  // Modal xem trước phân bổ FEFO
  const [previewPrescriptionId, setPreviewPrescriptionId] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [confirmingDispense, setConfirmingDispense] = useState(false);

  // Modal in đơn thuốc sau cấp phát hoặc in lại
  const [printData, setPrintData] = useState<PrescriptionPrintDto | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getPendingPrescriptions({ pageIndex, pageSize });
      if (res.data.success) {
        setPrescriptions(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      }
    } catch {
      message.error('Không thể tải danh sách đơn thuốc chờ cấp phát');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, message]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Xem/in đơn thuốc theo prescriptionId
  const handleOpenPrint = async (prescriptionId: number) => {
    setPrintLoading(true);
    setPrintModalOpen(true);
    try {
      const res = await inventoryApi.getPrescriptionPrintData(prescriptionId);
      if (res.data.success && res.data.data) {
        setPrintData(res.data.data);
      } else {
        message.error(res.data.message || 'Không thể tải dữ liệu in đơn thuốc');
        setPrintModalOpen(false);
      }
    } catch {
      message.error('Lỗi khi tải thông tin in đơn thuốc');
      setPrintModalOpen(false);
    } finally {
      setPrintLoading(false);
    }
  };

  const handleConfirmDispense = async (pId: number) => {
    setConfirmingDispense(true);
    setDispensingId(pId);
    try {
      const idempotencyKey = `DISP-${pId}-${Date.now()}`;
      const res = await inventoryApi.dispensePrescription(pId, idempotencyKey);
      if (res.data.success) {
        const result = res.data.data;
        message.success(`Đã cấp phát thành công đơn thuốc #${pId}`);
        setPreviewModalOpen(false);
        onDispenseSuccess?.(result);

        // Mở modal in đơn thuốc ngay lập tức theo DTO printData từ backend
        if (result.printData) {
          setPrintData(result.printData);
          setPrintModalOpen(true);
        } else {
          await handleOpenPrint(pId);
        }

        await fetchPending();
      } else {
        message.error(res.data.message || 'Cấp phát thất bại');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi cấp phát thuốc');
    } finally {
      setConfirmingDispense(false);
      setDispensingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnsType<PendingPrescriptionDto> = [
    {
      title: 'Mã đơn',
      key: 'prescriptionId',
      width: 130,
      render: (_, record) => {
        const id = record.prescriptionId || record.id;
        const code = record.prescriptionCode || `#${id}`;
        return (
          <Text strong style={{ color: '#0b4f6c' }}>
            {code}
          </Text>
        );
      },
    },
    {
      title: 'Lượt khám',
      key: 'visitId',
      width: 110,
      render: (_, record) => `#${record.maLuotKham || record.visitId}`,
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (name, record) => (
        <div>
          <Text strong>{name || '--'}</Text>
          {record.patientCode && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{record.patientCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Bác sĩ kê',
      key: 'doctor',
      width: 140,
      render: (_, record) => record.doctorName || `BS #${record.maBacSi}`,
    },
    {
      title: 'Ngày kê',
      key: 'prescribedAt',
      width: 110,
      render: (_, record) => formatDate(record.ngayKe || record.prescribedAt),
    },
    {
      title: 'Viện phí',
      key: 'payment',
      width: 150,
      align: 'center',
      render: (_, record) => {
        if (record.isPaid) {
          return (
            <Tag color="success" style={{ fontWeight: 600, padding: '2px 8px' }}>
              ● ĐÃ THANH TOÁN
            </Tag>
          );
        }
        return (
          <Tag color="warning" style={{ fontWeight: 600, padding: '2px 8px' }}>
            ● CHƯA THANH TOÁN
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const status = record.trangThai || record.status;
        if (status === 'CHO_CAP_PHAT' || status === 'CHO_CAP') {
          return <Tag color="processing">Chờ cấp phát</Tag>;
        }
        if (status === 'DA_XUAT_HET' || status === 'DA_CAP') {
          return <Tag color="success">Đã cấp phát</Tag>;
        }
        return <Tag color="default">{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 170,
      align: 'center',
      render: (_, record) => {
        const pId = record.prescriptionId || record.id || 0;
        const status = record.trangThai || record.status;
        const isPending = status === 'CHO_CAP_PHAT' || status === 'CHO_CAP';
        const canDispense = record.canDispense !== false;

        return (
          <Space size="small">
            {isPending ? (
              <Tooltip
                title={
                  !canDispense
                    ? 'Bệnh nhân chưa thanh toán viện phí tại quầy thu ngân'
                    : 'Xem trước phân bổ FEFO và xác nhận cấp phát'
                }
              >
                <span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    disabled={!canDispense}
                    loading={dispensingId === pId}
                    onClick={() => {
                      setPreviewPrescriptionId(pId);
                      setPreviewModalOpen(true);
                    }}
                  >
                    Xem & Cấp phát
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                size="small"
                icon={<PrinterOutlined />}
                onClick={() => handleOpenPrint(pId)}
              >
                In đơn
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <MedicineBoxOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
          <Text strong>Đơn thuốc chờ cấp phát</Text>
          <Tag color="blue">{total} đơn</Tag>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={fetchPending} loading={loading}>
          Tải lại
        </Button>
      </div>

      <Table<PendingPrescriptionDto>
        rowKey={(r) => String(r.prescriptionId || r.id)}
        columns={columns}
        dataSource={prescriptions}
        loading={loading}
        size="middle"
        pagination={{
          current: pageIndex,
          pageSize,
          total,
          onChange: (page, size) => {
            setPageIndex(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          showTotal: (t, range) =>
            `Hiển thị ${range[0]}–${range[1]} / ${t} đơn`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              Không có đơn thuốc nào đang chờ cấp phát
            </div>
          ),
        }}
      />

      {/* Modal xem trước phân bổ FEFO */}
      <FefoPreviewModal
        open={previewModalOpen}
        prescriptionId={previewPrescriptionId}
        onConfirmDispense={handleConfirmDispense}
        confirming={confirmingDispense}
        onCancel={() => {
          setPreviewModalOpen(false);
          setPreviewPrescriptionId(null);
        }}
      />

      {/* Modal in đơn thuốc chuẩn Y Tế */}
      <PrescriptionPrintModal
        open={printModalOpen}
        data={printData}
        loading={printLoading}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintData(null);
        }}
      />
    </div>
  );
};

export default DispensePanel;
