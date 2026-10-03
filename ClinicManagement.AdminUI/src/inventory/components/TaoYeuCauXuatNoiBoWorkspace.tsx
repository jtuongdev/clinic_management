import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
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
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  SendOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { inventoryApi } from '../api/inventory.api';
import { coSoApi } from '../../facility/api/facility.api';
import { khoaApi } from '../../department/api/department.api';
import { clinicApi } from '../../clinic/api/axios.clinic.api';
import { employeeApi, type EmployeeLookupDto } from '../../employee/api/employee.api';
import type {
  TaoYeuCauXuatNoiBoRequest,
  ItemDto,
  StockDto,
} from '../types/inventory.types';
import type { CoSoDropdownDto } from '../../facility/type/facility.type';
import type { KhoaDropdownDto } from '../../department/type/department.type';
import type { PhongKhamDropdownDto } from '../../clinic/type/drow.clinic.type';

const { Text } = Typography;
const { TextArea } = Input;

export interface TaoYeuCauXuatNoiBoWorkspaceProps {
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

export const TaoYeuCauXuatNoiBoWorkspace: React.FC<TaoYeuCauXuatNoiBoWorkspaceProps> = ({
  open,
  defaultWarehouseId = 1,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  // ─── Data States ────────────────────────────────────────────────────────
  const [facilities, setFacilities] = useState<CoSoDropdownDto[]>([]);
  const [departments, setDepartments] = useState<KhoaDropdownDto[]>([]);
  const [rooms, setRooms] = useState<PhongKhamDropdownDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeLookupDto[]>([]);

  // Item & Stock catalog cache
  const [catalogItems, setCatalogItems] = useState<ItemDto[]>([]);
  const [stockMap, setStockMap] = useState<Map<number, number>>(new Map()); // itemId -> available stock

  // UI / Loading states
  const [loadingFacilities, setLoadingFacilities] = useState(false);
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
  const selectedFacility = Form.useWatch('maCoSo', form);
  const selectedKhoa = Form.useWatch('maKhoa', form);

  // ─── 1. Load Cơ sở & Items Catalog when Workspace opens ──────────────────
  useEffect(() => {
    if (!open) return;

    // Reset form & lines
    form.resetFields();
    setDepartments([]);
    setRooms([]);
    setEmployees([]);
    setLines([{ id: `line-${Date.now()}`, itemId: undefined, quantity: 1, note: '' }]);

    // 1.1 Load Cơ sở khám chữa bệnh từ API backend có sẵn (/api/CoSo/dropdown)
    setLoadingFacilities(true);
    coSoApi
      .getDropdown()
      .then((res: any) => {
        const raw = res?.data;
        const list: CoSoDropdownDto[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];
        setFacilities(list);

        // Mặc định chọn cơ sở đầu tiên nếu có
        if (list.length > 0) {
          form.setFieldsValue({ maCoSo: list[0].id });
        }
      })
      .catch((err) => {
        console.error('Lỗi nạp danh sách cơ sở:', err);
        message.error('Không thể tải danh sách Cơ sở.');
      })
      .finally(() => setLoadingFacilities(false));

    // 1.2 Load Items Catalog (Chỉ lấy Vật tư y tế tiêu hao) & Stock
    setLoadingItems(true);
    Promise.all([
      inventoryApi.getItems({ pageIndex: 1, pageSize: 500, isActive: true, itemType: 'VA_TU' }),
      inventoryApi.getStock({ warehouseId: defaultWarehouseId, pageIndex: 1, pageSize: 500 }),
    ])
      .then(([itemsRes, stockRes]: [any, any]) => {
        const itemRaw = itemsRes?.data;
        const itemList: ItemDto[] = Array.isArray(itemRaw)
          ? itemRaw
          : Array.isArray(itemRaw?.data?.items)
          ? itemRaw.data.items
          : Array.isArray(itemRaw?.items)
          ? itemRaw.items
          : [];

        // Lọc nghiêm ngặt chỉ lấy Vật tư (VA_TU / VAT_TU / VatTu)
        const suppliesOnly = itemList.filter(
          (item) => item.itemType === 'VA_TU' || (item.itemType as any) === 'VAT_TU' || (item.itemType as any) === 'VatTu'
        );
        setCatalogItems(suppliesOnly);

        const stockRaw = stockRes?.data;
        const stockList: StockDto[] = Array.isArray(stockRaw)
          ? stockRaw
          : Array.isArray(stockRaw?.data?.items)
          ? stockRaw.data.items
          : Array.isArray(stockRaw?.items)
          ? stockRaw.items
          : [];

        const map = new Map<number, number>();
        stockList.forEach((s: StockDto) => {
          map.set(s.itemId, s.totalStock ?? 0);
        });
        setStockMap(map);
      })
      .catch((err) => {
        console.error('Lỗi nạp danh mục vật tư/tồn kho:', err);
      })
      .finally(() => setLoadingItems(false));
  }, [open, form, defaultWarehouseId]);

  // ─── 1.5. Cascading: Khi Cơ sở thay đổi -> Nạp danh sách Khoa của Cơ sở đó
  useEffect(() => {
    if (!open) return;

    if (!selectedFacility) {
      setDepartments([]);
      form.setFieldsValue({ maKhoa: undefined, maPhong: undefined, nguoiNhanId: undefined });
      return;
    }

    setLoadingDepts(true);
    khoaApi
      .getDropdown(selectedFacility)
      .then((res: any) => {
        const raw = res?.data;
        const list: KhoaDropdownDto[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];
        setDepartments(list);
      })
      .catch((err) => {
        console.error('Lỗi nạp danh sách Khoa theo cơ sở:', err);
        setDepartments([]);
      })
      .finally(() => setLoadingDepts(false));
  }, [selectedFacility, open, form]);

  // ─── 2. Cascading: Khi Khoa thay đổi -> Nạp danh sách Phòng & Nhân viên ─
  useEffect(() => {
    if (!open) return;

    if (!selectedKhoa) {
      setRooms([]);
      form.setFieldsValue({ maPhong: undefined, nguoiNhanId: undefined });
      setEmployees([]);
      return;
    }

    // Reset phòng và người nhận khi đổi khoa
    form.setFieldsValue({ maPhong: undefined, nguoiNhanId: undefined });

    // Load Phòng khám trực thuộc Khoa (robust data unpacking)
    setLoadingRooms(true);
    clinicApi
      .getDropdownPhongKhamByKhoa(selectedKhoa)
      .then((res: any) => {
        const raw = res?.data;
        const list: PhongKhamDropdownDto[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];
        setRooms(list);
      })
      .catch((err) => {
        console.error('Lỗi nạp phòng khám theo khoa:', err);
        setRooms([]);
      })
      .finally(() => setLoadingRooms(false));

    // Load Nhân viên theo Khoa (robust data unpacking)
    setLoadingEmps(true);
    employeeApi
      .getLookup({ maKhoa: selectedKhoa, isActive: true })
      .then((res: any) => {
        const raw = res?.data;
        const list: EmployeeLookupDto[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];
        setEmployees(list);
      })
      .catch((err) => {
        console.error('Lỗi nạp nhân viên theo khoa:', err);
        setEmployees([]);
      })
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
      message.warning('Phiếu yêu cầu xuất phải có ít nhất một dòng vật tư.');
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
          label: `[${item.code}] ${item.name} (${item.baseUnit}) — Tồn: ${stock.toLocaleString()}`,
          item,
          stock,
          filterText: `${item.code} ${item.name} ${item.baseUnit}`.toLowerCase(),
        };
      });
  }, [catalogItems, stockMap]);

  // Thống kê nhanh danh sách vật tư
  const totalItemCount = useMemo(() => {
    return lines.filter((l) => l.itemId && (l.quantity ?? 0) > 0).length;
  }, [lines]);

  const totalQuantitySum = useMemo(() => {
    return lines.reduce((sum, l) => sum + (l.quantity || 0), 0);
  }, [lines]);

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
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: '#64748b' }}>{index + 1}</span>
      ),
    },
    {
      title: 'Vật tư tiêu hao (Tìm theo Mã VT hoặc Tên)',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (_, record) => (
        <Select
          showSearch
          value={record.itemId}
          placeholder="Nhập mã (VT001...) hoặc tên vật tư tiêu hao..."
          style={{ width: '100%' }}
          options={itemSelectOptions}
          loading={loadingItems}
          filterOption={(input, option) =>
            (option?.filterText ?? '').includes(input.toLowerCase().trim())
          }
          onChange={(val) => handleItemChange(record.id, val)}
          notFoundContent={loadingItems ? <Spin size="small" /> : 'Không tìm thấy vật tư phù hợp'}
        />
      ),
    },
    {
      title: 'Tồn kho khả dụng',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 140,
      align: 'center',
      render: (val, record) => {
        if (!record.itemId) return <Text type="secondary">—</Text>;
        const stock = val ?? 0;
        const isOutOfStock = stock <= 0;
        return (
          <Badge
            count={`${stock.toLocaleString()} ${record.unit || ''}`.trim()}
            style={{
              backgroundColor: isOutOfStock ? '#ef4444' : stock < 10 ? '#f59e0b' : '#10b981',
              color: '#fff',
              fontWeight: 600,
              fontSize: 12,
              padding: '0 8px',
            }}
            overflowCount={999999}
          />
        );
      },
    },
    {
      title: 'Số lượng yêu cầu',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'center',
      render: (val, record) => (
        <InputNumber
          min={0.01}
          step={1}
          value={val}
          onChange={(q) => handleQuantityChange(record.id, q)}
          style={{ width: '100%', fontWeight: 600 }}
          status={!val || val <= 0 ? 'error' : ''}
        />
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 90,
      align: 'center',
      render: (val, record) => (
        <span
          style={{
            fontWeight: 700,
            color: record.itemId ? '#0284c7' : '#94a3b8',
            backgroundColor: record.itemId ? '#e0f2fe' : '#f1f5f9',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {record.itemId ? val || '—' : '—'}
        </span>
      ),
    },
    {
      title: 'Ghi chú từng dòng',
      dataIndex: 'note',
      key: 'note',
      render: (val, record) => (
        <Input
          placeholder="Lý do xuất, bổ sung tủ trực..."
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

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#f8fafc',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. HEADER CHUẨN HIS (h-14 / 56px)                                         */}
      {/* ========================================================================= */}
      <header
        style={{
          height: 56,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Cụm điều hướng & Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginRight: 14,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeftOutlined /> Quay lại danh sách
          </button>

          <div style={{ height: 20, width: 1, backgroundColor: '#cbd5e1', margin: '0 12px' }} />

          <MedicineBoxOutlined style={{ color: '#0284c7', fontSize: 20, marginRight: 8 }} />

          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            LẬP PHIẾU XUẤT CẤP PHÁT NỘI BỘ (KHOA / PHÒNG)
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#0284c7',
              backgroundColor: '#e0f2fe',
              border: '1px solid #bae6fd',
              borderRadius: 4,
              padding: '2px 8px',
              marginLeft: 12,
            }}
          >
            TRẠNG THÁI: [MỚI TẠO / NHÁP]
          </span>
        </div>

        {/* Cụm nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: 16,
            padding: 8,
            borderRadius: 6,
          }}
          title="Đóng không lưu"
        >
          <CloseOutlined />
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE NỘI DUNG (CUỘN ĐỘC LẬP)                                  */}
      {/* ========================================================================= */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          maxWidth: 1440,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* KHỐI 1: THÔNG TIN TIẾP NHẬN & PHÒNG BAN */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '20px 24px',
              marginBottom: 20,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: 10,
              }}
            >
              <CheckCircleOutlined style={{ color: '#0284c7' }} />
              THÔNG TIN KHOA / PHÒNG TIẾP NHẬN
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1.2fr', gap: 16 }}>
              {/* Dropdown 0: Cơ sở bệnh viện */}
              <Form.Item
                name="maCoSo"
                label={
                  <span style={{ fontWeight: 600, color: '#334155' }}>
                    Cơ sở bệnh viện <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn cơ sở' }]}
              >
                <Select
                  showSearch
                  placeholder="-- Chọn cơ sở --"
                  loading={loadingFacilities}
                  options={facilities.map((f) => ({
                    label: f.ten || f.ma,
                    value: f.id,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                />
              </Form.Item>

              {/* Dropdown 1: Khoa */}
              <Form.Item
                name="maKhoa"
                label={
                  <span style={{ fontWeight: 600, color: '#334155' }}>
                    Khoa / Trung tâm tiếp nhận <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn Khoa/Phòng nhận' }]}
              >
                <Select
                  showSearch
                  placeholder={selectedFacility ? '-- Chọn Khoa tiếp nhận --' : 'Vui lòng chọn Cơ sở'}
                  disabled={!selectedFacility}
                  loading={loadingDepts}
                  options={departments.map((d) => ({
                    label: d.ten,
                    value: d.id,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                />
              </Form.Item>

              {/* Dropdown 2: Phòng chức năng */}
              <Form.Item
                name="maPhong"
                label={<span style={{ fontWeight: 600, color: '#334155' }}>Phòng chức năng / Khám</span>}
                rules={[{ required: false }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={
                    selectedKhoa
                      ? '-- Chọn Phòng nhận (nếu có) --'
                      : 'Vui lòng chọn Khoa trước'
                  }
                  disabled={!selectedKhoa}
                  loading={loadingRooms}
                  options={rooms.map((r) => ({
                    label: r.ten || r.ma,
                    value: r.id,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                />
              </Form.Item>

              {/* Dropdown 3: Người nhận hàng */}
              <Form.Item
                name="nguoiNhanId"
                label={<span style={{ fontWeight: 600, color: '#334155' }}>Người nhận / Trưởng bộ phận</span>}
                rules={[{ required: false }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={
                    selectedKhoa
                      ? '-- Chọn người nhận bàn giao --'
                      : 'Chọn Khoa để nạp nhân viên'
                  }
                  disabled={!selectedKhoa}
                  loading={loadingEmps}
                  options={employees.map((e) => ({
                    label: `${e.hoTen} (${e.chucVu || 'Nhân viên'})`,
                    value: e.id,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            {/* Ghi chú tổng quát */}
            <Form.Item
              name="ghiChu"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Ghi chú đợt cấp phát</span>}
              style={{ marginBottom: 0 }}
            >
              <TextArea
                rows={2}
                placeholder="Ví dụ: Cấp phát vật tư tiêu hao tủ trực định kỳ tháng 10, dự trù ca phẫu thuật..."
              />
            </Form.Item>
          </div>

          {/* KHỐI 2: BẢNG CHI TIẾT VẬT TƯ (FULL-PAGE WIDTH) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '20px 24px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Space size={8}>
                <InboxOutlined style={{ color: '#0284c7', fontSize: 18 }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                  DANH SÁCH VẬT TƯ TIÊU HAO XUẤT CẤP PHÁT
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
                  height: 36,
                }}
              >
                + Thêm dòng vật tư
              </Button>
            </div>

            <Table
              dataSource={lines}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
              bordered
              style={{ borderRadius: 8, overflow: 'hidden' }}
            />

            {/* Lưu ý quy trình HIS */}
            <Alert
              style={{ marginTop: 20 }}
              message={
                <span style={{ fontSize: 13, color: '#1e293b' }}>
                  <strong>Quy trình cấp phát HIS:</strong> Sau khi gửi yêu cầu, phiếu sẽ ở trạng thái{' '}
                  <strong style={{ color: '#d97706' }}>Chờ duyệt</strong>. Quản trị kho sẽ duyệt và hệ thống tự động trừ kho tổng theo nguyên tắc <strong>FEFO</strong> (ưu tiên hạn dùng gần nhất). Trưởng bộ phận sẽ xác nhận đã nhận hàng sau khi kiểm đếm thực tế.
                </span>
              }
              type="info"
              showIcon
            />
          </div>
        </Form>
      </main>

      {/* ========================================================================= */}
      {/* 3. THANH THAO TÁC CỐ ĐỊNH CHÂN TRANG (STICKY ACTION BAR - 56px)           */}
      {/* ========================================================================= */}
      <footer
        style={{
          height: 56,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 -2px 4px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Tóm tắt nhanh */}
        <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>
            Tổng số mặt hàng:{' '}
            <strong style={{ color: '#0f172a', fontWeight: 700 }}>{totalItemCount}</strong>
          </span>
          <span>•</span>
          <span>
            Tổng số lượng xuất:{' '}
            <strong style={{ color: '#0284c7', fontWeight: 700, fontFamily: 'monospace', fontSize: 14 }}>
              {totalQuantitySum.toLocaleString()}
            </strong>
          </span>
        </div>

        {/* Nút thao tác */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 38,
              padding: '0 20px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Hủy bỏ / Quay lại
          </button>

          <button
            type="button"
            disabled={submitting || totalItemCount === 0}
            onClick={() => form.submit()}
            style={{
              height: 38,
              padding: '0 24px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: submitting || totalItemCount === 0 ? '#93c5fd' : '#0284c7',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: submitting || totalItemCount === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
              transition: 'background 0.15s ease',
            }}
          >
            <SendOutlined />
            {submitting ? 'Đang gửi yêu cầu...' : 'GỬI YÊU CẦU XUẤT KHO'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TaoYeuCauXuatNoiBoWorkspace;
