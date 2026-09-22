import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Input,
  Switch,
  Button,
  Select,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Tooltip,
  App,
  message as staticMessage,
  Card,
  Space,
  Table,
  Badge,
  Popconfirm,
  Alert,
} from 'antd';
import {
  ShopOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  FieldTimeOutlined,
  BranchesOutlined,
  ClearOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { inventoryApi } from '../api/inventory.api';
import {
  PurchaseOrderPendingDto,
  PurchaseOrderForImportDto,
  PurchaseOrderForImportLineDto,
  CreateImportFromPoRequest,
  SupplierDto,
} from '../types/inventory.types';

const { Text, Title } = Typography;
const { TextArea } = Input;

export interface ImportFromPOModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (receiptResult?: any) => void;
}

interface EditablePoLineItem extends PurchaseOrderForImportLineDto {
  receivingQuantity: number;
  batchNumber: string;
  expiryDate: Dayjs | null;
  lineTotal: number;
  isOverOrdered: boolean;
}

export const ImportFromPOModal: React.FC<ImportFromPOModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
  const [pendingOrders, setPendingOrders] = useState<PurchaseOrderPendingDto[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<number | undefined>(undefined);
  const [currentPo, setCurrentPo] = useState<PurchaseOrderForImportDto | null>(null);
  const [poLines, setPoLines] = useState<EditablePoLineItem[]>([]);

  // Form thông tin hành chính đợt giao
  const [receivedAt, setReceivedAt] = useState<Dayjs>(dayjs());
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [saveDraft, setSaveDraft] = useState<boolean>(false);

  // Điền nhanh HSD chung
  const [commonExpiryDate, setCommonExpiryDate] = useState<Dayjs | null>(null);

  const appContext = App.useApp();
  const message = appContext?.message || staticMessage;

  // Tải danh sách nhà cung cấp & danh sách đơn đặt hàng chờ giao khi mở modal
  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }
    fetchSuppliers();
    fetchPendingOrders();
  }, [open]);

  // Lọc danh sách PO khi chọn nhà cung cấp
  useEffect(() => {
    if (open) {
      fetchPendingOrders(selectedSupplierId);
    }
  }, [selectedSupplierId]);

  const resetForm = () => {
    setSelectedSupplierId(undefined);
    setSelectedPoId(undefined);
    setCurrentPo(null);
    setPoLines([]);
    setReferenceCode('');
    setNote('');
    setSaveDraft(false);
    setReceivedAt(dayjs());
    setCommonExpiryDate(null);
  };

  const fetchSuppliers = async () => {
    try {
      const res = await inventoryApi.getSuppliers({ pageSize: 100 });
      if (res.data?.data?.items) {
        setSuppliers(res.data.data.items);
      }
    } catch {
      // Ignored
    }
  };

  const fetchPendingOrders = async (supplierId?: number) => {
    setLoading(true);
    try {
      const res = await inventoryApi.getPendingPurchaseOrders(supplierId);
      if (res.data?.data) {
        setPendingOrders(res.data.data);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách đơn đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  // Khi chọn 1 PO từ dropdown, nạp chi tiết PO và danh sách thuốc
  const handleSelectPo = async (poId: number) => {
    setSelectedPoId(poId);
    setLoading(true);
    try {
      const res = await inventoryApi.getPurchaseOrderForImport(poId);
      if (res.data?.data) {
        const poData = res.data.data;
        setCurrentPo(poData);
        setSelectedSupplierId(poData.supplierId);

        // Sinh danh sách dòng chỉnh sửa
        const lines: EditablePoLineItem[] = (poData.lines || []).map((line) => {
          // Mặc định đề xuất HSD 18 tháng sau nếu là thuốc
          const defaultExpiry = line.itemType === 'THUOC' ? dayjs().add(18, 'month') : null;
          const receivingQty = line.quantityRemaining > 0 ? line.quantityRemaining : 0;
          return {
            ...line,
            receivingQuantity: receivingQty,
            batchNumber: line.defaultBatchNumber || '',
            expiryDate: defaultExpiry,
            lineTotal: receivingQty * line.unitPrice,
            isOverOrdered: false,
          };
        });

        setPoLines(lines);
        setNote(`Nhập kho theo đơn đặt hàng #${poData.poCode}`);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải chi tiết đơn đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng nhận của 1 dòng
  const handleQuantityChange = (poDetailId: number, val: number | null) => {
    const newQty = val !== null && val >= 0 ? val : 0;
    setPoLines((prev) =>
      prev.map((line) => {
        if (line.poDetailId !== poDetailId) return line;
        const isOver = newQty > line.quantityRemaining;
        return {
          ...line,
          receivingQuantity: newQty,
          lineTotal: newQty * line.unitPrice,
          isOverOrdered: isOver,
        };
      })
    );
  };

  // Cập nhật số lô
  const handleBatchChange = (poDetailId: number, val: string) => {
    setPoLines((prev) =>
      prev.map((line) =>
        line.poDetailId === poDetailId ? { ...line, batchNumber: val.trim() } : line
      )
    );
  };

  // Tự sinh số lô cho 1 dòng cụ thể
  const handleGenerateBatchForLine = (poDetailId: number) => {
    const target = poLines.find((l) => l.poDetailId === poDetailId);
    if (!target) return;
    const dateStr = dayjs().format('YYMMDD');
    const rawCode = target.itemCode || target.itemName || 'LOT';
    const codePart = rawCode.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'LOT';
    const rand = Math.floor(100 + Math.random() * 900);
    const newBatch = `L${dateStr}-${codePart}${rand}`;

    handleBatchChange(poDetailId, newBatch);
    message.success(`Đã tự sinh số lô: ${newBatch}`);
  };

  // Cập nhật HSD
  const handleExpiryChange = (poDetailId: number, date: Dayjs | null) => {
    setPoLines((prev) =>
      prev.map((line) =>
        line.poDetailId === poDetailId ? { ...line, expiryDate: date } : line
      )
    );
  };

  // Xóa bỏ 1 dòng (chuyến xe không giao mặt hàng này)
  const handleRemoveLine = (poDetailId: number) => {
    setPoLines((prev) => prev.filter((l) => l.poDetailId !== poDetailId));
    message.info('Đã loại bỏ mặt hàng khỏi đợt nhận hàng này.');
  };

  // Điền nhanh HSD chung cho toàn bộ các dòng còn trống
  const handleApplyCommonExpiry = () => {
    if (!commonExpiryDate) {
      message.warning('Vui lòng chọn ngày Hạn sử dụng trước khi áp dụng.');
      return;
    }
    setPoLines((prev) =>
      prev.map((line) => ({
        ...line,
        expiryDate: commonExpiryDate,
      }))
    );
    message.success(`Đã áp dụng HSD ${commonExpiryDate.format('DD/MM/YYYY')} cho tất cả mặt hàng!`);
  };

  // Tự sinh số lô cho toàn bộ các dòng còn trống
  const handleAutoGenerateAllBatches = () => {
    const dateStr = dayjs().format('YYMMDD');
    let count = 0;
    setPoLines((prev) =>
      prev.map((line) => {
        if (!line.batchNumber) {
          const rawCode = line.itemCode || line.itemName || 'LOT';
          const codePart = rawCode.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'LOT';
          const rand = Math.floor(100 + Math.random() * 900);
          count++;
          return {
            ...line,
            batchNumber: `L${dateStr}-${codePart}${rand}`,
          };
        }
        return line;
      })
    );
    message.success(`Đã tự sinh số lô cho ${count} mặt hàng.`);
  };

  // Đặt lại số lượng nhận về mặc định (bằng số lượng còn lại)
  const handleResetQuantities = () => {
    setPoLines((prev) =>
      prev.map((line) => ({
        ...line,
        receivingQuantity: line.quantityRemaining > 0 ? line.quantityRemaining : 0,
        lineTotal: (line.quantityRemaining > 0 ? line.quantityRemaining : 0) * line.unitPrice,
        isOverOrdered: false,
      }))
    );
    message.info('Đã khôi phục số lượng nhận theo số lượng còn lại của PO.');
  };

  // Thống kê đợt nhận hàng
  const totalReceivingItems = useMemo(
    () => poLines.filter((l) => l.receivingQuantity > 0).length,
    [poLines]
  );
  const totalReceivingAmount = useMemo(
    () => poLines.reduce((sum, l) => sum + (l.receivingQuantity > 0 ? l.lineTotal : 0), 0),
    [poLines]
  );
  const hasOverOrderedLine = useMemo(
    () => poLines.some((l) => l.receivingQuantity > l.quantityRemaining),
    [poLines]
  );

  // Xử lý gửi phiếu nhập
  const handleSubmit = async () => {
    if (!currentPo) {
      message.error('Vui lòng chọn một Đơn đặt hàng (PO).');
      return;
    }

    const activeLines = poLines.filter((l) => l.receivingQuantity > 0);
    if (activeLines.length === 0) {
      message.error('Vui lòng nhập số lượng nhận > 0 cho ít nhất một mặt hàng.');
      return;
    }

    // Kiểm tra Số lô và HSD
    for (const line of activeLines) {
      if (!line.batchNumber || line.batchNumber.trim() === '') {
        message.error(`Mặt hàng "${line.itemName}" chưa có Số lô. Vui lòng nhập hoặc bấm ⚡ để tự sinh.`);
        return;
      }
      if (line.itemType === 'THUOC') {
        if (!line.expiryDate || line.expiryDate.isBefore(dayjs(), 'day')) {
          message.error(`Thuốc "${line.itemName}" chưa chọn Hạn sử dụng hoặc HSD đã quá hạn.`);
          return;
        }
      }
    }

    // Nếu có dòng giao thừa, xác nhận với người dùng
    if (hasOverOrderedLine) {
      Modal.confirm({
        title: 'Cảnh báo giao vượt số lượng đặt',
        icon: <WarningOutlined style={{ color: '#f59e0b' }} />,
        content:
          'Một số mặt hàng có số lượng nhận lớn hơn số lượng còn lại của Đơn đặt hàng. Bạn có chắc chắn nhà cung cấp giao thừa và muốn tiếp nhận?',
        okText: 'Đồng ý tiếp nhận',
        cancelText: 'Xem lại',
        okButtonProps: { danger: true },
        onOk: () => doSubmit(activeLines),
      });
      return;
    }

    await doSubmit(activeLines);
  };

  const doSubmit = async (activeLines: EditablePoLineItem[]) => {
    if (!currentPo) return;
    setSubmitting(true);
    try {
      const payload: CreateImportFromPoRequest = {
        purchaseOrderId: currentPo.id,
        supplierId: currentPo.supplierId,
        warehouseId: currentPo.warehouseId,
        receivedAt: receivedAt.toISOString(),
        referenceCode: referenceCode.trim() || undefined,
        note: note.trim() || undefined,
        saveDraft,
        idempotencyKey: `PO-IMP-${currentPo.id}-${Date.now()}`,
        lines: activeLines.map((l) => ({
          poDetailId: l.poDetailId,
          itemId: l.itemId,
          quantity: l.receivingQuantity,
          purchasePrice: l.unitPrice,
          batchNumber: l.batchNumber.trim(),
          expiryDate: l.expiryDate ? l.expiryDate.toISOString() : null,
          unit: l.unit,
        })),
      };

      const res = await inventoryApi.createImportFromPo(payload);
      const data = res.data?.data;

      message.success(
        saveDraft
          ? `Đã tạo phiếu nhập nháp từ PO #${currentPo.poCode} thành công!`
          : `Đã nhập kho chính thức từ PO #${currentPo.poCode}! Tồn kho và trạng thái PO đã được cập nhật.`
      );

      onSuccess(data);
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi tạo phiếu nhập từ đơn đặt hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cấu hình các cột của Bảng đối soát thông minh
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{index + 1}</Text>
      ),
    },
    {
      title: 'Mặt hàng thuốc / VTYT',
      key: 'item',
      width: 260,
      render: (_: any, record: EditablePoLineItem) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
              {record.itemName}
            </Text>
            <Tag color={record.itemType === 'THUOC' ? 'blue' : 'orange'} style={{ fontSize: 10, margin: 0, padding: '0 4px' }}>
              {record.itemType === 'THUOC' ? 'Thuốc' : 'VTYT'}
            </Tag>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Mã: <span style={{ fontFamily: 'monospace', color: '#334155' }}>{record.itemCode}</span>
            <Divider type="vertical" style={{ margin: '0 4px' }} />
            ĐVT: <Tag color="default" style={{ fontSize: 11, margin: 0 }}>{record.unit}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'SL Đặt',
      key: 'quantityOrdered',
      width: 85,
      align: 'center' as const,
      render: (_: any, record: EditablePoLineItem) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', fontFamily: 'monospace' }}>
          {record.quantityOrdered.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Đã nhận',
      key: 'quantityReceived',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: EditablePoLineItem) => (
        <Tag color={record.quantityReceived > 0 ? 'cyan' : 'default'} style={{ fontSize: 11, margin: 0 }}>
          {record.quantityReceived.toLocaleString('vi-VN')}
        </Tag>
      ),
    },
    {
      title: 'Còn lại',
      key: 'quantityRemaining',
      width: 85,
      align: 'center' as const,
      render: (_: any, record: EditablePoLineItem) => (
        <Tag color={record.quantityRemaining > 0 ? 'gold' : 'green'} style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>
          {record.quantityRemaining.toLocaleString('vi-VN')}
        </Tag>
      ),
    },
    {
      title: (
        <span>
          SL Nhận đợt này <span style={{ color: '#ef4444' }}>*</span>
        </span>
      ),
      key: 'receivingQuantity',
      width: 140,
      render: (_: any, record: EditablePoLineItem) => (
        <div>
          <InputNumber
            min={0}
            max={record.quantityOrdered * 2}
            value={record.receivingQuantity}
            onChange={(val) => handleQuantityChange(record.poDetailId, val)}
            style={{
              width: '100%',
              borderColor: record.isOverOrdered ? '#f59e0b' : record.receivingQuantity > 0 ? '#10b981' : '#cbd5e1',
              backgroundColor: record.receivingQuantity === 0 ? '#f8fafc' : '#ffffff',
            }}
            placeholder="0"
          />
          {record.isOverOrdered && (
            <div style={{ fontSize: 10, color: '#d97706', marginTop: 2 }}>
              ⚠️ Vượt SL còn ({record.quantityRemaining})
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn giá PO (₫)',
      key: 'unitPrice',
      width: 120,
      align: 'right' as const,
      render: (_: any, record: EditablePoLineItem) => (
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0b4f6c', fontFamily: 'monospace' }}>
            {record.unitPrice.toLocaleString('vi-VN')}
          </div>
          <Tag color="purple" style={{ fontSize: 9.5, margin: 0, padding: '0 3px' }}>
            Giá theo PO
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <span>
          Số lô (Batch) <span style={{ color: '#ef4444' }}>*</span>
        </span>
      ),
      key: 'batchNumber',
      width: 155,
      render: (_: any, record: EditablePoLineItem) => (
        <Input
          value={record.batchNumber}
          onChange={(e) => handleBatchChange(record.poDetailId, e.target.value)}
          placeholder="Số lô trên hộp..."
          status={!record.batchNumber && record.receivingQuantity > 0 ? 'error' : ''}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
          suffix={
            <Tooltip title="Tự sinh số lô y tế chuẩn cho dòng này">
              <ThunderboltOutlined
                style={{ color: '#f59e0b', cursor: 'pointer', fontSize: 13 }}
                onClick={() => handleGenerateBatchForLine(record.poDetailId)}
              />
            </Tooltip>
          }
        />
      ),
    },
    {
      title: (
        <span>
          Hạn sử dụng <span style={{ color: '#ef4444' }}>*</span>
        </span>
      ),
      key: 'expiryDate',
      width: 140,
      render: (_: any, record: EditablePoLineItem) => (
        <DatePicker
          format="DD/MM/YYYY"
          value={record.expiryDate}
          onChange={(date) => handleExpiryChange(record.poDetailId, date)}
          disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
          status={!record.expiryDate && record.receivingQuantity > 0 && record.itemType === 'THUOC' ? 'error' : ''}
          style={{ width: '100%' }}
          placeholder="Hạn dùng"
        />
      ),
    },
    {
      title: 'Thành tiền (₫)',
      key: 'lineTotal',
      width: 120,
      align: 'right' as const,
      render: (_: any, record: EditablePoLineItem) => (
        <Text
          strong
          style={{
            fontSize: 13,
            color: record.receivingQuantity > 0 ? '#0b4f6c' : '#94a3b8',
            fontFamily: 'monospace',
          }}
        >
          {record.lineTotal.toLocaleString('vi-VN')}
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 45,
      align: 'center' as const,
      render: (_: any, record: EditablePoLineItem) => (
        <Tooltip title="Chưa giao mặt hàng này (Loại khỏi đợt nhập)">
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveLine(record.poDetailId)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0b4f6c 0%, #1e88e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <FileTextOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Tạo Phiếu Nhập Kho từ Đơn Đặt Hàng (PO)
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
              Tiếp nhận hàng hóa, đối soát số lượng và tự động cập nhật tiến độ giao hàng của PO
            </div>
          </div>
        </div>
      }
      width={1240}
      style={{ top: 20 }}
      styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', padding: '12px 16px' } }}
      onCancel={onClose}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <Text style={{ fontSize: 12, color: '#64748b' }}>Mặt hàng nhận:</Text>{' '}
              <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
                {totalReceivingItems} / {poLines.length}
              </Text>
            </div>
            <Divider type="vertical" style={{ height: 20 }} />
            <div>
              <Text style={{ fontSize: 12, color: '#64748b' }}>Tổng tiền thanh toán đợt này:</Text>{' '}
              <Text strong style={{ fontSize: 17, color: '#0b4f6c', fontFamily: 'monospace' }}>
                {totalReceivingAmount.toLocaleString('vi-VN')} ₫
              </Text>
            </div>
            <Divider type="vertical" style={{ height: 20 }} />
            <Space size="small">
              <Switch
                checked={saveDraft}
                onChange={setSaveDraft}
                checkedChildren="Lưu tạm"
                unCheckedChildren="Duyệt ngay"
              />
              <Text style={{ fontSize: 12, color: saveDraft ? '#f59e0b' : '#10b981' }}>
                {saveDraft ? 'Chờ duyệt nội bộ' : 'Duyệt & Tăng tồn kho'}
              </Text>
            </Space>
          </div>

          <Space>
            <Button onClick={onClose} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              disabled={!currentPo || totalReceivingItems === 0}
              onClick={handleSubmit}
              style={{
                backgroundColor: '#0b4f6c',
                borderColor: '#0b4f6c',
                fontWeight: 600,
                minWidth: 160,
              }}
            >
              {saveDraft ? 'Lưu Phiếu Nháp' : 'Xác Nhận Nhập Kho'}
            </Button>
          </Space>
        </div>
      }
    >
      {/* KHỐI 1: CHỌN ĐƠN ĐẶT HÀNG & THÔNG TIN HÀNH CHÍNH */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 8,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <Row gutter={[12, 12]}>
          {/* Lọc theo NCC */}
          <Col span={6}>
            <Text style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
              <ShopOutlined /> Lọc theo Nhà cung cấp:
            </Text>
            <Select
              allowClear
              showSearch
              placeholder="Tất cả nhà cung cấp"
              value={selectedSupplierId}
              onChange={(val) => {
                setSelectedSupplierId(val);
                setSelectedPoId(undefined);
                setCurrentPo(null);
                setPoLines([]);
              }}
              style={{ width: '100%', marginTop: 4 }}
              optionFilterProp="label"
              options={suppliers.map((s) => ({
                value: s.id,
                label: `[${s.ma}] ${s.ten}`,
              }))}
            />
          </Col>

          {/* Chọn Đơn đặt hàng PO */}
          <Col span={10}>
            <Text style={{ fontSize: 12, color: '#0b4f6c', fontWeight: 700 }}>
              <FileTextOutlined /> Chọn Đơn đặt hàng (PO) chờ giao <span style={{ color: '#ef4444' }}>*</span>:
            </Text>
            <Select
              showSearch
              placeholder="-- Chọn mã đơn đặt hàng để nạp dữ liệu --"
              value={selectedPoId}
              onChange={handleSelectPo}
              loading={loading}
              style={{ width: '100%', marginTop: 4 }}
              optionFilterProp="label"
              options={pendingOrders.map((po) => ({
                value: po.id,
                label: `[#${po.poCode}] ${po.supplierName} - ${dayjs(po.orderDate).format('DD/MM/YYYY')} (${po.itemCount} mặt hàng)`,
              }))}
            />
          </Col>

          {/* Ngày thực nhận */}
          <Col span={4}>
            <Text style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
              <CalendarOutlined /> Ngày nhập kho:
            </Text>
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              value={receivedAt}
              onChange={(date) => date && setReceivedAt(date)}
              style={{ width: '100%', marginTop: 4 }}
            />
          </Col>

          {/* Số HĐ / Phiếu giao hàng kèm */}
          <Col span={4}>
            <Text style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
              Số HĐ / Chứng từ kèm:
            </Text>
            <Input
              placeholder="VD: HĐ-88219..."
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </Col>
        </Row>

        {/* Thông tin chi tiết PO đang chọn */}
        {currentPo && (
          <div
            style={{
              marginTop: 10,
              padding: '8px 12px',
              backgroundColor: '#eff6ff',
              borderRadius: 6,
              border: '1px solid #bfdbfe',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <Space size="middle" wrap>
              <div>
                <Text style={{ fontSize: 12, color: '#1e40af' }}>Mã PO:</Text>{' '}
                <Text strong style={{ fontSize: 13, color: '#1e3a8a', fontFamily: 'monospace' }}>
                  #{currentPo.poCode}
                </Text>
                <Tag
                  color={currentPo.status === 'DA_DAT' ? 'blue' : 'orange'}
                  style={{ marginLeft: 6, fontSize: 11 }}
                >
                  {currentPo.status === 'DA_DAT' ? 'Đã duyệt / Chờ giao' : 'Giao một phần'}
                </Tag>
              </div>

              <div>
                <Text style={{ fontSize: 12, color: '#1e40af' }}>Nhà cung cấp:</Text>{' '}
                <Text strong style={{ fontSize: 12.5, color: '#0f172a' }}>
                  {currentPo.supplierName} ({currentPo.supplierCode})
                </Text>
              </div>

              <div>
                <Text style={{ fontSize: 12, color: '#1e40af' }}>Kho nhận:</Text>{' '}
                <Tag color="purple" style={{ margin: 0 }}>
                  {currentPo.warehouseName}
                </Tag>
              </div>

              {currentPo.expectedDeliveryDate && (
                <div>
                  <Text style={{ fontSize: 12, color: '#1e40af' }}>Dự kiến giao:</Text>{' '}
                  <Text style={{ fontSize: 12, color: '#334155' }}>
                    {dayjs(currentPo.expectedDeliveryDate).format('DD/MM/YYYY')}
                  </Text>
                </div>
              )}
            </Space>

            <div style={{ flex: 1, minWidth: 200, maxWidth: 350 }}>
              <Input
                size="small"
                placeholder="Ghi chú đợt giao..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* KHỐI 2: CÔNG CỤ NHANH VÀ BẢNG ĐỐI SOÁT */}
      {currentPo ? (
        <div>
          {/* Thanh công cụ thao tác hàng loạt */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MedicineBoxOutlined style={{ color: '#0b4f6c' }} />
              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                Bảng Đối Soát Hàng Thực Nhận ({poLines.length} mặt hàng)
              </Text>
            </div>

            <Space size="small">
              {/* Điền nhanh HSD chung */}
              <Space.Compact size="small">
                <DatePicker
                  placeholder="Chọn HSD chung..."
                  format="DD/MM/YYYY"
                  value={commonExpiryDate}
                  onChange={setCommonExpiryDate}
                  disabledDate={(curr) => curr && curr.isBefore(dayjs().startOf('day'))}
                  style={{ width: 140 }}
                />
                <Button
                  type="default"
                  icon={<CalendarOutlined />}
                  onClick={handleApplyCommonExpiry}
                  disabled={!commonExpiryDate}
                >
                  Áp dụng HSD
                </Button>
              </Space.Compact>

              <Divider type="vertical" style={{ margin: '0 4px' }} />

              {/* Tự sinh số lô toàn bộ */}
              <Button
                size="small"
                icon={<ThunderboltOutlined style={{ color: '#f59e0b' }} />}
                onClick={handleAutoGenerateAllBatches}
              >
                Tự sinh Số lô
              </Button>

              {/* Đặt lại số lượng */}
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleResetQuantities}
              >
                Reset SL
              </Button>
            </Space>
          </div>

          {/* Bảng đối soát */}
          <Table
            rowKey="poDetailId"
            columns={columns}
            dataSource={poLines}
            pagination={false}
            size="small"
            bordered
            scroll={{ y: 380 }}
            style={{ borderRadius: 6, overflow: 'hidden' }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px dashed #cbd5e1',
          }}
        >
          <FileTextOutlined style={{ fontSize: 42, color: '#94a3b8' }} />
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: '#475569' }}>
            Chưa chọn Đơn đặt hàng (PO)
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#94a3b8' }}>
            Vui lòng chọn một đơn đặt hàng ở thanh phía trên để bung danh mục thuốc và đối soát nhận hàng.
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ImportFromPOModal;
