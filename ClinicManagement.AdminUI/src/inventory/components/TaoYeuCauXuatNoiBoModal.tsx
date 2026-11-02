import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Table,
  Badge,
  Typography,
  Space,
  App,
  Spin,
  Alert,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { inventoryApi } from '../api/inventory.api';
import { khoaApi } from '../../department/api/department.api';
import { clinicApi } from '../../clinic/api/axios.clinic.api';
import { employeeApi, type EmployeeLookupDto } from '../../employee/api/employee.api';
import type {
  TaoYeuCauXuatNoiBoRequest,
  ItemDto,
  StockDto,
} from '../types/inventory.types';
import type { KhoaDropdownDto } from '../../department/type/department.type';
import type { PhongKhamDropdownDto } from '../../clinic/type/drow.clinic.type';

const { Text } = Typography;
const { TextArea } = Input;

export interface TaoYeuCauXuatNoiBoModalProps {
  open: boolean;
  defaultWarehouseId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormLineItem {
  id: string; // unique key cho React
  itemId?: number;
  itemCode?: string;
  itemName?: string;
  currentStock?: number;
  unit?: string;
  quantity?: number;
  note?: string;
}

export const TaoYeuCauXuatNoiBoModal: React.FC<TaoYeuCauXuatNoiBoModalProps> = ({
  open,
  defaultWarehouseId = 1,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  // ─── Data States ────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState<KhoaDropdownDto[]>([]);
  const [rooms, setRooms] = useState<PhongKhamDropdownDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeLookupDto[]>([]);

  // Item & Stock catalog cache
  const [catalogItems, setCatalogItems] = useState<ItemDto[]>([]);
  const [stockMap, setStockMap] = useState<Map<number, number>>(new Map()); // itemId -> available stock

  // UI / Loading states
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingEmps, setLoadingEmps] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Line items state
  const [lines, setLines] = useState<FormLineItem[]>([
    { id: 'line-1', itemId: undefined, quantity: 1, note: '' },
  ]);

  // Watch form fields for cascading
  const selectedKhoa = Form.useWatch('maKhoa', form);
  const selectedPhong = Form.useWatch('maPhong', form);

  // ─── 1. Load Khoa & Items Catalog when Modal opens ─────────────────────
  useEffect(() => {
    if (!open) return;

    // Reset form & lines
    form.resetFields();
    setRooms([]);
    setEmployees([]);
    setLines([{ id: `line-${Date.now()}`, itemId: undefined, quantity: 1, note: '' }]);

    // Load Khoa dropdown
    setLoadingDepts(true);
    khoaApi
      .getDropdown(1)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setDepartments(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải danh sách khoa:', err);
      })
      .finally(() => setLoadingDepts(false));

    // Load Items Catalog (Chỉ lấy Vật tư y tế tiêu hao) & Stock
    setLoadingItems(true);
    Promise.all([
      inventoryApi.getItems({ pageIndex: 1, pageSize: 500, isActive: true, itemType: 'VA_TU' }),
      inventoryApi.getStock({ warehouseId: defaultWarehouseId, pageIndex: 1, pageSize: 500 }),
    ])
      .then(([itemsRes, stockRes]) => {
        const itemRaw = itemsRes?.data;
        const itemList: ItemDto[] = Array.isArray(itemRaw)
          ? itemRaw
          : Array.isArray(itemRaw?.data?.items)
          ? itemRaw.data.items
          : Array.isArray(itemRaw?.items)
          ? itemRaw.items
          : [];

        const suppliesOnly = itemList.filter(
          (item) => item.itemType === 'VA_TU' || (item.itemType as any) === 'VAT_TU' || (item.itemType as any) === 'VatTu'
        );
        setCatalogItems(suppliesOnly);

        if (stockRes.data?.data?.items) {
          const map = new Map<number, number>();
          stockRes.data.data.items.forEach((s: StockDto) => {
            map.set(s.itemId, s.totalStock ?? 0);
          });
          setStockMap(map);
        }
      })
      .catch((err) => {
        console.error('Lỗi nạp danh mục vật tư/tồn kho:', err);
      })
      .finally(() => setLoadingItems(false));
  }, [open, form, defaultWarehouseId]);

  // ─── 2. Cascading: Khi Khoa thay đổi -> Nạp danh sách Phòng & Nhân viên ─
  useEffect(() => {
    if (!open) return;

    if (!selectedKhoa) {
      setRooms([]);
      form.setFieldsValue({ maPhong: undefined, nguoiNhanId: undefined });
      setEmployees([]);
      return;
    }

    // Reset phòng và nhân viên khi chọn khoa mới
    form.setFieldsValue({ maPhong: undefined, nguoiNhanId: undefined });

    // Load Phòng khám trực thuộc Khoa
    setLoadingRooms(true);
    clinicApi
      .getDropdownPhongKhamByKhoa(selectedKhoa)
      .then((res) => {
        const data = res.data?.data;
        setRooms(Array.isArray(data) ? data : []);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));

    // Load Nhân viên theo Khoa
    setLoadingEmps(true);
    employeeApi
      .getLookup({ maKhoa: selectedKhoa, isActive: true })
      .then((res) => {
        const data = res.data?.data;
        setEmployees(Array.isArray(data) ? data : []);
      })
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmps(false));
  }, [selectedKhoa, open, form]);

  // ─── 3. Line Items Operations ──────────────────────────────────────────
  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: undefined,
        quantity: 1,
        note: '',
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) {
      message.warning('Yêu cầu phải có ít nhất một dòng vật tư.');
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleItemChange = (lineId: string, itemId: number) => {
    const item = catalogItems.find((c) => c.id === itemId);
    const stock = stockMap.get(itemId) ?? 0;

    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          itemId,
          itemCode: item?.code,
          itemName: item?.name,
          unit: item?.baseUnit || 'cái',
          currentStock: stock,
        };
      })
    );
  };

  const handleQuantityChange = (lineId: string, quantity: number | null) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        return { ...line, quantity: quantity ?? 0 };
      })
    );
  };

  const handleNoteChange = (lineId: string, note: string) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        return { ...line, note };
      })
    );
  };

  // Autocomplete options cho Vật tư (search cả Mã và Tên, loại trừ toàn bộ thuốc)
  const itemSelectOptions = useMemo(() => {
    return catalogItems
      .filter((item) => item.itemType === 'VA_TU' || (item.itemType as any) === 'VAT_TU' || (item.itemType as any) === 'VatTu')
      .map((item) => {
        const stock = stockMap.get(item.id) ?? 0;
        return {
          value: item.id,
          label: `[${item.code}] ${item.name} (${item.baseUnit}) - Tồn: ${stock.toLocaleString()}`,
          item,
          stock,
          filterText: `${item.code} ${item.name} ${item.baseUnit}`.toLowerCase(),
        };
      });
  }, [catalogItems, stockMap]);

  // ─── 4. Submit Form ────────────────────────────────────────────────────
  const handleFinish = async (values: any) => {
    // Validate lines
    const validLines = lines.filter((l) => l.itemId && (l.quantity ?? 0) > 0);
    if (validLines.length === 0) {
      message.error('Vui lòng chọn ít nhất một vật tư với số lượng hợp lệ (> 0).');
      return;
    }

    // Check duplicate items
    const itemIds = validLines.map((l) => l.itemId!);
    if (new Set(itemIds).size !== itemIds.length) {
      message.error('Danh sách có vật tư bị trùng lặp. Vui lòng gộp số lượng.');
      return;
    }

    // Ghép thông tin Phòng vào Ghi chú đợt cấp phát để lưu vết phòng nhận
    const selectedRoomObj = rooms.find((r) => r.id === values.maPhong);
    const roomText = selectedRoomObj ? `[Phòng: ${selectedRoomObj.ten || selectedRoomObj.ma}]` : '';
    const fullGhiChu = [roomText, values.ghiChu?.trim()].filter(Boolean).join(' ');

    const payload: TaoYeuCauXuatNoiBoRequest = {
      maKhoXuat: defaultWarehouseId,
      maKhoaNhan: values.maKhoa,
      nguoiNhanId: values.nguoiNhanId || undefined,
      ghiChu: fullGhiChu || undefined,
      idempotencyKey: `YC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      items: validLines.map((l) => ({
        itemId: l.itemId!,
        soLuong: l.quantity!,
        donViTinh: l.unit,
        ghiChu: l.note?.trim() || undefined,
      })),
    };

    setSubmitting(true);
    try {
      const res = await inventoryApi.createInternalRequest(payload);
      if (res.data?.success || res.status === 200 || res.status === 201) {
        message.success('Đã gửi yêu cầu xuất cấp phát nội bộ thành công!');
        onSuccess();
        onClose();
      } else {
        message.error(res.data?.message || 'Không thể tạo yêu cầu xuất vật tư.');
      }
    } catch (err: any) {
      console.error('Lỗi gửi yêu cầu xuất nội bộ:', err);
      message.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu xuất vật tư.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── 5. Columns Configuration for Table ────────────────────────────────
  const columns: ColumnsType<FormLineItem> = [
    {
      title: 'STT',
      width: 55,
      align: 'center',
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: 'Vật tư tiêu hao (Mã / Tên)',
      dataIndex: 'itemId',
      key: 'itemId',
      width: 320,
      render: (_, record) => (
        <Select
          showSearch
          value={record.itemId}
          placeholder="Tìm theo mã (VT001...) hoặc tên vật tư..."
          style={{ width: '100%' }}
          options={itemSelectOptions}
          loading={loadingItems}
          filterOption={(input, option) =>
            (option?.filterText ?? '').includes(input.toLowerCase().trim())
          }
          onChange={(val) => handleItemChange(record.id, val)}
          notFoundContent={loadingItems ? <Spin size="small" /> : 'Không tìm thấy vật tư'}
        />
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      align: 'center',
      render: (val, record) => {
        if (!record.itemId) return <Text type="secondary">—</Text>;
        const stock = val ?? 0;
        const isOutOfStock = stock <= 0;
        return (
          <Badge
            count={stock.toLocaleString()}
            style={{
              backgroundColor: isOutOfStock ? '#ef4444' : stock < 10 ? '#f59e0b' : '#10b981',
              color: '#fff',
              fontWeight: 600,
              fontSize: 12,
            }}
            overflowCount={99999}
          />
        );
      },
    },
    {
      title: 'SL yêu cầu',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'center',
      render: (val, record) => (
        <InputNumber
          min={0.01}
          step={1}
          value={val}
          onChange={(q) => handleQuantityChange(record.id, q)}
          style={{ width: '100%' }}
          status={!val || val <= 0 ? 'error' : ''}
        />
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center',
      render: (val, record) => (
        <Text style={{ fontWeight: 600, color: '#334155' }}>
          {record.itemId ? val || '—' : '—'}
        </Text>
      ),
    },
    {
      title: 'Ghi chú dòng',
      dataIndex: 'note',
      key: 'note',
      render: (val, record) => (
        <Input
          placeholder="Lý do xuất, tủ trực..."
          value={val}
          onChange={(e) => handleNoteChange(record.id, e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xoá dòng">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveLine(record.id)}
            disabled={lines.length <= 1}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={
        <Space size={8}>
          <MedicineBoxOutlined style={{ color: '#0284c7', fontSize: 20 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
            Tạo đơn xuất cấp phát nội bộ (Khoa / Phòng)
          </span>
        </Space>
      }
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={950}
      okText="Gửi yêu cầu xuất"
      cancelText="Hủy bỏ"
      okButtonProps={{
        style: {
          background: '#0284c7',
          borderColor: '#0284c7',
          fontWeight: 600,
          borderRadius: 6,
          padding: '0 20px',
        },
      }}
      cancelButtonProps={{
        style: {
          borderRadius: 6,
          padding: '0 16px',
        },
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 12 }}>
        {/* Hàng 1: Khoa, Phòng và Người nhận (Cascading Select) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {/* Dropdown 1: Khoa */}
          <Form.Item
            name="maKhoa"
            label={<span style={{ fontWeight: 600 }}>Khoa / Trung tâm nhận</span>}
            rules={[{ required: true, message: 'Vui lòng chọn Khoa/Phòng nhận' }]}
          >
            <Select
              showSearch
              placeholder="-- Chọn Khoa --"
              loading={loadingDepts}
              options={departments.map((d) => ({
                label: d.ten,
                value: d.id,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {/* Dropdown 2: Phòng trực thuộc */}
          <Form.Item
            name="maPhong"
            label={<span style={{ fontWeight: 600 }}>Phòng chức năng / Khám</span>}
            rules={[{ required: false }]}
          >
            <Select
              showSearch
              allowClear
              placeholder={selectedKhoa ? '-- Chọn Phòng nhận (nếu có) --' : 'Vui lòng chọn Khoa trước'}
              disabled={!selectedKhoa}
              loading={loadingRooms}
              options={rooms.map((r) => ({
                label: r.ten || r.ma,
                value: r.id,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {/* Dropdown 3: Người nhận hàng / Trưởng khoa/phòng */}
          <Form.Item
            name="nguoiNhanId"
            label={<span style={{ fontWeight: 600 }}>Người nhận / Trưởng bộ phận</span>}
            rules={[{ required: false }]}
          >
            <Select
              showSearch
              allowClear
              placeholder={
                selectedKhoa ? '-- Chọn người nhận bàn giao --' : 'Chọn Khoa để nạp nhân viên'
              }
              disabled={!selectedKhoa}
              loading={loadingEmps}
              options={employees.map((e) => ({
                label: `${e.hoTen} (${e.chucVu || 'NV'})`,
                value: e.id,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </div>

        {/* Ghi chú tổng quát */}
        <Form.Item name="ghiChu" label={<span style={{ fontWeight: 600 }}>Ghi chú đợt cấp phát</span>}>
          <TextArea
            rows={2}
            placeholder="Ví dụ: Cấp phát vật tư tủ trực định kỳ tháng 10, đợt phẫu thuật ngoại trú..."
          />
        </Form.Item>

        {/* Bảng danh sách vật tư yêu cầu */}
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Space size={6}>
              <InboxOutlined style={{ color: '#0284c7', fontSize: 16 }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                Danh sách vật tư tiêu hao yêu cầu
              </span>
              <Badge count={lines.length} style={{ backgroundColor: '#0284c7' }} />
            </Space>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddLine}
              style={{
                borderColor: '#0284c7',
                color: '#0284c7',
                fontWeight: 600,
                borderRadius: 6,
              }}
            >
              Thêm dòng vật tư
            </Button>
          </div>

          <Table
            dataSource={lines}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}
          />
        </div>

        {/* Lưu ý quy trình HIS */}
        <Alert
          style={{ marginTop: 16 }}
          message={
            <span style={{ fontSize: 12.5 }}>
              <strong>Quy trình cấp phát HIS:</strong> Sau khi gửi yêu cầu, phiếu sẽ ở trạng thái{' '}
              <Text strong style={{ color: '#d97706' }}>
                Chờ duyệt
              </Text>
              . Quản trị kho sẽ duyệt và hệ thống tự động trừ kho tổng theo nguyên tắc FEFO. Trưởng bộ phận sẽ xác nhận khi nhận đủ hàng.
            </span>
          }
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );
};

export default TaoYeuCauXuatNoiBoModal;
