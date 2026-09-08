import React, { useEffect, useState } from 'react';
import {
  Steps,
  Button,
  Table,
  InputNumber,
  Form,
  Input,
  Typography,
  Space,
  Tag,
  App,
  Card,
} from 'antd';
import { SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { StockDto } from '../types/inventory.types';
import { inventoryApi } from '../api/inventory.api';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface StocktakePanelProps {
  stocks: StockDto[];
}

interface CountRow {
  stockId: number;
  itemName: string;
  lotNumber: string;
  expiryDate: string | null;
  systemQuantity: number;
  unit: string;
  actualQuantity?: number;
  reason?: string;
  saved: boolean;
}

const StocktakePanel: React.FC<StocktakePanelProps> = ({ stocks }) => {
  const { message } = App.useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [noteForm] = Form.useForm<{ note: string }>();

  const [stocktakeId, setStocktakeId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);

  // Bảng dữ liệu đếm
  const createCountRows = (source: StockDto[]): CountRow[] =>
    source.flatMap((stock) => stock.batches.map((batch) => ({
      stockId: batch.stockId,
      itemName: stock.itemName,
      lotNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      systemQuantity: batch.quantity,
      unit: stock.baseUnit,
      actualQuantity: undefined,
      reason: '',
      saved: false,
    })));

  const [countRows, setCountRows] = useState<CountRow[]>(() => createCountRows(stocks));

  useEffect(() => {
    if (stocktakeId === null) {
      setCountRows(createCountRows(stocks));
    }
  }, [stocks, stocktakeId]);

  const [savingRowId, setSavingRowId] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Bước 1: Lập đợt kiểm kê
  const handleCreateStocktake = async (values: { note: string }) => {
    if (!stocks.length) {
      message.warning('Không có dữ liệu tồn kho để kiểm kê');
      return;
    }
    setCreating(true);
    try {
      const res = await inventoryApi.createStocktake({
        note: values.note,
        idempotencyKey: `STK-${Date.now()}`,
      });
      if (res.data.success) {
        setStocktakeId(res.data.data.id);
        message.success(`Đã lập đợt kiểm kê #${res.data.data.id}`);
        setCurrentStep(1);
      } else {
        message.error(res.data.message || 'Lập đợt kiểm kê thất bại');
      }
    } catch {
      message.error('Có lỗi khi lập đợt kiểm kê');
    } finally {
      setCreating(false);
    }
  };

  // Bước 2: Lưu số lượng thực tế từng lô
  const handleSaveCount = async (row: CountRow) => {
    if (stocktakeId === null) return;
    if (row.actualQuantity === undefined || row.actualQuantity < 0) {
      message.warning('Vui lòng nhập số lượng thực tế hợp lệ');
      return;
    }
    setSavingRowId(row.stockId);
    try {
      const res = await inventoryApi.updateStocktakeCount(stocktakeId, {
        stockId: row.stockId,
        actualQuantity: row.actualQuantity,
        reason: row.reason,
      });
      if (res.data.success !== false) {
        setCountRows((prev) =>
          prev.map((r) => (r.stockId === row.stockId ? { ...r, saved: true } : r)),
        );
        message.success(`Đã lưu số lượng cho lô ${row.lotNumber}`);
      } else {
        message.error('Lưu số lượng thất bại');
      }
    } catch {
      message.error('Có lỗi khi lưu số lượng');
    } finally {
      setSavingRowId(null);
    }
  };

  // Bước 3: Nộp kiểm kê
  const handleSubmit = async () => {
    if (stocktakeId === null) return;
    const unsaved = countRows.filter((r) => !r.saved);
    if (unsaved.length > 0) {
      message.warning(`Còn ${unsaved.length} lô chưa được lưu số lượng thực tế`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await inventoryApi.submitStocktake(stocktakeId);
      if (res.data.success) {
        message.success('Đã nộp kiểm kê thành công');
        setCurrentStep(2);
      } else {
        message.error(res.data.message || 'Nộp kiểm kê thất bại');
      }
    } catch {
      message.error('Có lỗi khi nộp kiểm kê');
    } finally {
      setSubmitting(false);
    }
  };

  // Bước 3: Duyệt và điều chỉnh tồn
  const handleApprove = async () => {
    if (stocktakeId === null) return;
    setApproving(true);
    try {
      const res = await inventoryApi.approveStocktake(stocktakeId, {
        counts: countRows.map((count) => ({
          stockId: count.stockId,
          actualQuantity: count.actualQuantity ?? count.systemQuantity,
          reason: count.reason,
        })),
        idempotencyKey: `STK-APPROVE-${stocktakeId}-${Date.now()}`,
      });
      if (res.data.success) {
        message.success('Đã duyệt kiểm kê và điều chỉnh tồn kho thành công');
      } else {
        message.error(res.data.message || 'Duyệt kiểm kê thất bại');
      }
    } catch {
      message.error('Có lỗi khi duyệt kiểm kê');
    } finally {
      setApproving(false);
    }
  };

  const countColumns: ColumnsType<CountRow> = [
    {
      title: 'Mặt hàng',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name: string, row) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Lô: {row.lotNumber}
          </Text>
        </div>
      ),
    },
    {
      title: 'HSD',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: formatDate,
    },
    {
      title: 'Tồn hệ thống',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: 130,
      align: 'right',
      render: (qty: number, row) => `${qty} ${row.unit}`,
    },
    {
      title: 'Số lượng thực',
      key: 'actualQuantity',
      width: 140,
      render: (_, row) => (
        <InputNumber
          min={0}
          value={row.actualQuantity}
          disabled={row.saved}
          onChange={(val) =>
            setCountRows((prev) =>
              prev.map((r) =>
                r.stockId === row.stockId ? { ...r, actualQuantity: val ?? undefined } : r,
              ),
            )
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Lý do chênh lệch',
      key: 'reason',
      render: (_, row) => (
        <Input
          placeholder="Nhập lý do (nếu có)"
          value={row.reason}
          disabled={row.saved}
          onChange={(e) =>
            setCountRows((prev) =>
              prev.map((r) =>
                r.stockId === row.stockId ? { ...r, reason: e.target.value } : r,
              ),
            )
          }
        />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'saved',
      width: 100,
      align: 'center',
      render: (_, row) =>
        row.saved ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã lưu
          </Tag>
        ) : (
          <Tag color="default">Chưa lưu</Tag>
        ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      align: 'center',
      render: (_, row) => (
        <Button
          size="small"
          type="primary"
          disabled={row.saved}
          loading={savingRowId === row.stockId}
          onClick={() => handleSaveCount(row)}
        >
          Lưu số lượng
        </Button>
      ),
    },
  ];

  const steps = [
    {
      title: 'Lập đợt kiểm kê',
      description: 'Khởi tạo phiếu kiểm kê',
    },
    {
      title: 'Nhập số thực tế',
      description: 'Đếm và ghi nhận tồn thực tế',
    },
    {
      title: 'Duyệt & Điều chỉnh',
      description: 'Xác nhận và cập nhật tồn kho',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Steps current={currentStep} items={steps} style={{ padding: '0 24px' }} />

      {/* Bước 0: Lập đợt */}
      {currentStep === 0 && (
        <Card title="Lập đợt kiểm kê mới" style={{ maxWidth: 600 }}>
          <Form form={noteForm} layout="vertical" onFinish={handleCreateStocktake}>
            <Form.Item name="note" label="Ghi chú đợt kiểm kê">
              <TextArea
                rows={3}
                placeholder="VD: Kiểm kê định kỳ tháng 9/2026 – toàn bộ kho dược"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={creating}
                icon={<CheckCircleOutlined />}
              >
                Lập đợt kiểm kê
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Bước 1: Nhập số thực tế */}
      {currentStep === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>
              Nhập số lượng thực tế — Đợt #{stocktakeId}
            </Title>
            <Space>
              <Text type="secondary">
                {countRows.filter((r) => r.saved).length}/{countRows.length} lô đã lưu
              </Text>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                onClick={handleSubmit}
              >
                Nộp kiểm kê
              </Button>
            </Space>
          </div>

          <Table<CountRow>
            rowKey="stockId"
            columns={countColumns}
            dataSource={countRows}
            size="middle"
            pagination={false}
            rowClassName={(row) => (row.saved ? 'ant-table-row-saved' : '')}
            locale={{
              emptyText: (
                <div style={{ padding: '32px 0', color: '#94a3b8' }}>
                  Không có dữ liệu tồn kho
                </div>
              ),
            }}
          />
        </div>
      )}

      {/* Bước 2: Duyệt */}
      {currentStep === 2 && (
        <Card
          style={{ maxWidth: 600 }}
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span>Duyệt và điều chỉnh tồn kho</span>
            </Space>
          }
        >
          <p style={{ color: '#4a5568' }}>
            Phiếu kiểm kê <Text strong>#{stocktakeId}</Text> đã được nộp thành công. Quản lý kho
            có thể xem xét và duyệt để hệ thống tự động điều chỉnh số lượng tồn kho theo kết quả
            thực tế.
          </p>
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={approving}
              onClick={handleApprove}
            >
              Duyệt và điều chỉnh tồn
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default StocktakePanel;
