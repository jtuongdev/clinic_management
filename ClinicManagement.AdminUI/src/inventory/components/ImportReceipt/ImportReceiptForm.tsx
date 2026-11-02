import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Space, App, message as staticMessage } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  AppstoreAddOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { inventoryApi } from '../../api/inventory.api';
import type {
  ImportReceiptRequest,
  ImportLineRequest,
  SupplierDto,
  ItemDto,
  CreateItemRequest,
} from '../../types/inventory.types';
import ItemFormModal from '../ItemFormModal';
import ItemPickerModal from '../ItemPickerModal';
import ImportFromPOModal from '../ImportFromPOModal';

import type { ImportReceiptFormProps, ImportFormValues } from './types';
import { generateLotNumber } from './helpers';
import { ImportHeaderBar } from './ImportHeaderBar';
import { ImportGeneralInfoBlock } from './ImportGeneralInfoBlock';
import { ImportLineRow } from './ImportLineRow';
import { ImportStickyFooter } from './ImportStickyFooter';

export const ImportReceiptForm: React.FC<ImportReceiptFormProps> = ({
  open,
  loading,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<ImportFormValues>();
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Modal tạo nhanh thuốc mới ngay tại phiếu nhập
  const [quickAddItemOpen, setQuickAddItemOpen] = useState(false);
  const [targetLineIndexForNewItem, setTargetLineIndexForNewItem] = useState<number | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);

  // Modal chọn hàng loạt thuốc từ danh mục
  const [itemPickerOpen, setItemPickerOpen] = useState(false);

  // Modal tiếp nhận hàng từ Đơn đặt hàng (PO)
  const [poModalOpen, setPoModalOpen] = useState(false);

  const appContext = App.useApp();
  const message = appContext?.message || staticMessage;

  const lines = Form.useWatch('lines', form) ?? [];

  // Map tra cứu mặt hàng theo Id
  const itemMap = useMemo(() => {
    const map = new Map<number, ItemDto>();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);

  // Tính tổng tiền toàn phiếu
  const totalAmount = useMemo(() => {
    if (!Array.isArray(lines)) return 0;
    return lines.reduce((sum, line) => {
      if (!line) return sum;
      return sum + (line.quantity ?? 0) * (line.purchasePrice ?? 0);
    }, 0);
  }, [lines]);

  // Tải danh mục NCC và Thuốc / Vật tư khi mở form
  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      setLoadingLookups(true);
      try {
        // Tải danh sách nhà cung cấp
        let supplierList: SupplierDto[] = [];
        try {
          const supplierRes = await inventoryApi.getSuppliers({ pageSize: 200, status: 1 });
          if (supplierRes.data.success && (supplierRes.data.data.items || []).length > 0) {
            supplierList = supplierRes.data.data.items;
          } else {
            const allSuppliers = await inventoryApi.getSuppliers({ pageSize: 200 });
            if (allSuppliers.data.success) {
              supplierList = allSuppliers.data.data.items || [];
            }
          }
        } catch {
          const allSuppliers = await inventoryApi.getSuppliers({ pageSize: 200 });
          if (allSuppliers.data.success) {
            supplierList = allSuppliers.data.data.items || [];
          }
        }

        // Bổ sung NCC của phiếu đang edit nếu chưa có trong list
        if (initialData?.supplier && !supplierList.some((s) => s.id === initialData.supplier.id)) {
          supplierList.unshift({
            id: initialData.supplier.id,
            ma: initialData.supplier.code || `NCC-${initialData.supplier.id}`,
            ten: initialData.supplier.name,
            dienThoai: initialData.supplier.phone || '',
            diaChi: initialData.supplier.address || '',
            email: '',
            maSoThue: initialData.supplier.taxCode || '',
            trangThai: 1,
          });
        }
        setSuppliers(supplierList);

        // Tải danh mục thuốc / vật tư y tế
        const itemRes = await inventoryApi.getItems({ pageSize: 1500, isActive: true });
        if (itemRes.data.success) {
          setItems(itemRes.data.data.items || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu cho phiếu nhập:', err);
      } finally {
        setLoadingLookups(false);
      }
    };

    void fetchLookups();
  }, [open, initialData]);

  // Khởi tạo giá trị form
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        supplierId: initialData.supplier?.id,
        warehouseId: initialData.warehouse?.id || 1,
        referenceCode: initialData.referenceCode || '',
        importDate: initialData.receivedAt ? dayjs(initialData.receivedAt) : dayjs(),
        note: initialData.note || '',
        saveDraft: initialData.status === 'CHO_DUYET' || initialData.status === 'TAM',
        lines:
          initialData.lines?.map((line) => ({
            itemId: line.itemId,
            unit: line.baseUnit,
            lotNumber: line.batchNumber || '',
            expiryDate: line.expiryDate ? dayjs(line.expiryDate) : (undefined as any),
            quantity: line.quantity,
            purchasePrice: line.purchasePrice,
          })) || [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        warehouseId: 1,
        importDate: dayjs(),
        saveDraft: true,
        lines: [
          {
            itemId: undefined as any,
            unit: undefined,
            lotNumber: '',
            expiryDate: undefined as any,
            quantity: 1,
            purchasePrice: 0,
          },
        ],
      });
    }
  }, [open, initialData, form]);

  // Thêm hàng loạt thuốc được chọn từ danh mục vào phiếu nhập
  const handleBulkAddItems = (selectedItems: ItemDto[]) => {
    if (!selectedItems || selectedItems.length === 0) return;

    const currentLines = form.getFieldValue('lines') || [];

    // Lọc bỏ các dòng hoàn toàn trống (chưa chọn itemId) nếu có
    const validExistingLines = currentLines.filter(
      (line: any) => line && line.itemId !== undefined && line.itemId !== null,
    );

    const newLines = selectedItems.map((item, idx) => ({
      itemId: item.id,
      unit: item.baseUnit,
      lotNumber: generateLotNumber(item, validExistingLines.length + idx),
      expiryDate: undefined,
      quantity: 1,
      purchasePrice: item.salePrice > 0 ? item.salePrice : 0,
    }));

    form.setFieldsValue({
      lines: [...validExistingLines, ...newLines],
    });

    message.success(
      `Đã thêm ${newLines.length} mặt hàng vào phiếu nhập (đã tự sinh số lô)! Vui lòng kiểm tra hạn dùng & số lượng.`,
    );
  };

  // Khi chọn mặt hàng, tự động điền ĐVT cơ bản & tự sinh số lô nếu chưa có
  const handleItemSelect = (itemId: number, fieldIndex: number) => {
    const selectedItem = itemMap.get(itemId);
    if (selectedItem) {
      const currentLines = form.getFieldValue('lines') || [];
      const updatedLines = [...currentLines];
      const existingLot = updatedLines[fieldIndex]?.lotNumber;
      updatedLines[fieldIndex] = {
        ...updatedLines[fieldIndex],
        itemId,
        unit: selectedItem.baseUnit,
        lotNumber:
          existingLot && existingLot.trim() !== ''
            ? existingLot
            : generateLotNumber(selectedItem, fieldIndex),
        purchasePrice:
          updatedLines[fieldIndex]?.purchasePrice || selectedItem.salePrice || 0,
      };
      form.setFieldsValue({ lines: updatedLines });
    }
  };

  // Tự sinh số lô cho tất cả các dòng còn trống (hoặc làm mới hàng loạt)
  const handleAutoGenerateAllLots = () => {
    const currentLines = form.getFieldValue('lines') || [];
    if (!currentLines || currentLines.length === 0) {
      message.warning('Chưa có mặt hàng nào trong phiếu');
      return;
    }

    let updatedCount = 0;
    const updatedLines = currentLines.map((line: any, idx: number) => {
      if (!line) return line;
      const itm = line.itemId ? itemMap.get(line.itemId) : undefined;
      if (!line.lotNumber || line.lotNumber.trim() === '') {
        updatedCount++;
        return {
          ...line,
          lotNumber: generateLotNumber(itm, idx),
        };
      }
      return line;
    });

    if (updatedCount === 0) {
      // Nếu tất cả các dòng đều đã có số lô, làm mới lại cho tất cả
      const reGenLines = currentLines.map((line: any, idx: number) => {
        const itm = line?.itemId ? itemMap.get(line.itemId) : undefined;
        return {
          ...line,
          lotNumber: generateLotNumber(itm, idx),
        };
      });
      form.setFieldsValue({ lines: reGenLines });
      message.success(
        `Đã làm mới số lô tự sinh cho toàn bộ ${reGenLines.length} dòng mặt hàng!`,
      );
      return;
    }

    form.setFieldsValue({ lines: updatedLines });
    message.success(`Đã tự sinh số lô cho ${updatedCount} dòng mặt hàng!`);
  };

  // Cập nhật số lượng nhanh cho một dòng
  const handleSetQuantity = (lineIndex: number, qty: number) => {
    const currentLines = form.getFieldValue('lines') || [];
    const updatedLines = [...currentLines];
    if (updatedLines[lineIndex]) {
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        quantity: Math.max(1, qty),
      };
      form.setFieldsValue({ lines: updatedLines });
    }
  };

  // Cộng thêm số lượng nhanh cho một dòng
  const handleAddQuantity = (lineIndex: number, delta: number) => {
    const currentLines = form.getFieldValue('lines') || [];
    const updatedLines = [...currentLines];
    if (updatedLines[lineIndex]) {
      const currentQty = Number(updatedLines[lineIndex].quantity || 0);
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        quantity: Math.max(1, currentQty + delta),
      };
      form.setFieldsValue({ lines: updatedLines });
    }
  };

  // Chuyển nhanh đơn vị tính của dòng
  const handleUnitChange = (lineIndex: number, newUnit: string) => {
    const currentLines = form.getFieldValue('lines') || [];
    const updatedLines = [...currentLines];
    if (updatedLines[lineIndex]) {
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        unit: newUnit,
      };
      form.setFieldsValue({ lines: updatedLines });
    }
  };

  const handleFinish = (values: ImportFormValues) => {
    const payload: ImportReceiptRequest = {
      supplierId: values.supplierId,
      warehouseId: values.warehouseId || 1,
      receivedAt: values.importDate.toISOString(),
      note: [values.referenceCode ? `Số HĐ/Chứng từ: ${values.referenceCode}` : '', values.note]
        .filter(Boolean)
        .join(' | '),
      saveDraft: values.saveDraft ?? true,
      idempotencyKey: `IMP-${Date.now()}`,
      items: values.lines.map(
        (l): ImportLineRequest => ({
          itemId: l.itemId,
          unit: l.unit,
          batchNumber: l.lotNumber.trim(),
          expiryDate: l.expiryDate?.toISOString(),
          quantity: l.quantity,
          purchasePrice: l.purchasePrice,
        }),
      ),
    };

    onSubmit(payload, initialData?.id);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const openQuickAddItem = (lineIndex?: number) => {
    setTargetLineIndexForNewItem(lineIndex ?? null);
    setQuickAddItemOpen(true);
  };

  const handleCreateQuickItem = async (data: CreateItemRequest) => {
    setCreatingItem(true);
    try {
      const res = await inventoryApi.createItem(data);
      if (res.data?.success) {
        const newId = res.data.data.id;
        const newItem: ItemDto = {
          id: newId,
          code: data.code,
          name: data.name,
          itemType: data.itemType,
          dosageForm: data.dosageForm || '',
          strength: data.strength || '',
          baseUnit: data.baseUnit,
          salePrice: data.salePrice,
          minimumStock: data.minimumStock,
          canPrescribe: data.canPrescribe,
          isActive: true,
          conversions: data.conversions || [],
        };

        setItems((prev) => [newItem, ...prev]);

        const currentLines = form.getFieldValue('lines') || [];
        if (
          targetLineIndexForNewItem !== null &&
          targetLineIndexForNewItem >= 0 &&
          targetLineIndexForNewItem < currentLines.length
        ) {
          const updatedLines = [...currentLines];
          updatedLines[targetLineIndexForNewItem] = {
            ...updatedLines[targetLineIndexForNewItem],
            itemId: newId,
            unit: newItem.baseUnit,
            purchasePrice: newItem.salePrice || 0,
          };
          form.setFieldsValue({ lines: updatedLines });
        } else {
          const lastIdx = currentLines.length - 1;
          if (lastIdx >= 0 && !currentLines[lastIdx]?.itemId) {
            const updatedLines = [...currentLines];
            updatedLines[lastIdx] = {
              ...updatedLines[lastIdx],
              itemId: newId,
              unit: newItem.baseUnit,
              purchasePrice: newItem.salePrice || 0,
            };
            form.setFieldsValue({ lines: updatedLines });
          } else {
            form.setFieldsValue({
              lines: [
                ...currentLines,
                {
                  itemId: newId,
                  unit: newItem.baseUnit,
                  lotNumber: '',
                  quantity: 1,
                  purchasePrice: newItem.salePrice || 0,
                },
              ],
            });
          }
        }

        message.success(`Đã thêm mới mặt hàng "${newItem.name}" và chọn vào dòng phiếu`);
        setQuickAddItemOpen(false);
        setTargetLineIndexForNewItem(null);
      } else {
        message.error(res.data?.message || 'Thêm mặt hàng thất bại');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi tạo mặt hàng mới');
    } finally {
      setCreatingItem(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="import-receipt-fullscreen"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '16px 20px 60px 20px',
      }}
    >
      {/* HEADER BAR ĐỈNH TRANG */}
      <ImportHeaderBar
        initialData={initialData}
        loading={loading}
        onCancel={handleCancel}
        onSubmit={() => form.submit()}
        onOpenPO={() => setPoModalOpen(true)}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          warehouseId: 1,
          importDate: dayjs(),
          saveDraft: true,
          lines: [
            {
              itemId: undefined,
              lotNumber: '',
              expiryDate: undefined,
              quantity: 1,
              purchasePrice: 0,
            },
          ],
        }}
      >
        {/* BLOCK 1: THÔNG TIN HÀNH CHÍNH & CHỨNG TỪ NHẬP */}
        <ImportGeneralInfoBlock
          suppliers={suppliers}
          loadingLookups={loadingLookups}
        />

        {/* BLOCK 2: CHI TIẾT MẶT HÀNG, SỐ LÔ & HẠN DÙNG (GPP) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
            <CalendarOutlined style={{ marginRight: 6, color: '#0284c7' }} />
            BLOCK 2: CHI TIẾT MẶT HÀNG, SỐ LÔ & HẠN DÙNG (GPP)
          </span>

          <Space>
            <Button
              size="small"
              icon={<ThunderboltOutlined />}
              style={{ color: '#0369a1', borderColor: '#7dd3fc', background: '#f0f9ff' }}
              onClick={handleAutoGenerateAllLots}
            >
              ⚡ Tự sinh số lô
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<AppstoreAddOutlined />}
              style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
              onClick={() => setItemPickerOpen(true)}
            >
              📋 Thêm nhanh từ danh mục
            </Button>
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              style={{ color: '#0284c7', borderColor: '#7dd3fc' }}
              onClick={() => openQuickAddItem()}
            >
              + Tạo thuốc mới vào danh mục
            </Button>
          </Space>
        </div>

        {/* Danh sách dòng chi tiết */}
        <Form.List
          name="lines"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length < 1) {
                  return Promise.reject(
                    new Error('Phiếu nhập phải có ít nhất 1 mặt hàng thuốc / vật tư'),
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <ImportLineRow
                  key={key}
                  name={name}
                  restField={restField}
                  items={items}
                  itemMap={itemMap}
                  currentLine={lines[name]}
                  loadingLookups={loadingLookups}
                  canDelete={fields.length > 1}
                  onRemove={() => remove(name)}
                  onItemSelect={handleItemSelect}
                  onQuickAddItem={openQuickAddItem}
                  onGenerateLot={(fieldIdx) => {
                    const currentLines = form.getFieldValue('lines') || [];
                    const updatedLines = [...currentLines];
                    const selectedItem = currentLines[fieldIdx]?.itemId
                      ? itemMap.get(currentLines[fieldIdx].itemId)
                      : undefined;
                    const newLot = generateLotNumber(selectedItem, fieldIdx);
                    updatedLines[fieldIdx] = {
                      ...updatedLines[fieldIdx],
                      lotNumber: newLot,
                    };
                    form.setFieldsValue({ lines: updatedLines });
                    message.success(`Đã tạo số lô: ${newLot}`);
                  }}
                  onSetQuantity={handleSetQuantity}
                  onAddQuantity={handleAddQuantity}
                  onUnitChange={handleUnitChange}
                />
              ))}

              <Form.ErrorList errors={errors} />

              <Button
                type="dashed"
                onClick={() =>
                  add({
                    itemId: undefined as any,
                    unit: undefined,
                    lotNumber: '',
                    expiryDate: undefined as any,
                    quantity: 1,
                    purchasePrice: 0,
                  })
                }
                icon={<PlusOutlined />}
                block
                style={{
                  marginTop: 4,
                  height: 38,
                  borderColor: '#93c5fd',
                  color: '#0284c7',
                }}
              >
                + Thêm dòng mặt hàng nhập kho
              </Button>
            </>
          )}
        </Form.List>

        {/* Sticky bottom bar */}
        <ImportStickyFooter
          validItemCount={lines.filter((l) => l?.itemId).length}
          totalAmount={totalAmount}
          loading={loading}
          isEditMode={!!initialData}
          onCancel={handleCancel}
        />
      </Form>

      {/* Modal tạo nhanh thuốc mới */}
      <ItemFormModal
        open={quickAddItemOpen}
        editingItem={null}
        loading={creatingItem}
        onSubmit={handleCreateQuickItem}
        onCancel={() => {
          setQuickAddItemOpen(false);
          setTargetLineIndexForNewItem(null);
        }}
      />

      {/* Modal chọn hàng loạt thuốc từ danh mục */}
      <ItemPickerModal
        open={itemPickerOpen}
        items={items}
        loading={loadingLookups}
        alreadySelectedIds={(lines || [])
          .map((l: any) => l?.itemId)
          .filter((id: any) => typeof id === 'number')}
        onCancel={() => setItemPickerOpen(false)}
        onSelectItems={handleBulkAddItems}
      />

      {/* Modal tiếp nhận hàng từ Đơn đặt hàng (PO) */}
      <ImportFromPOModal
        open={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        onSuccess={() => {
          onCancel();
        }}
      />
    </div>
  );
};

export default ImportReceiptForm;
