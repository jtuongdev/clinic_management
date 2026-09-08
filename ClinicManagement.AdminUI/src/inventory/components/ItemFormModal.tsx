import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Button,
  Divider,
  Checkbox,
  Typography,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ItemDto, CreateItemRequest } from '../types/inventory.types';

const { Text } = Typography;

interface ItemFormModalProps {
  open: boolean;
  editingItem: ItemDto | null; // null = thêm mới
  lockedFields?: string[];     // fields bị khóa khi đã có giao dịch
  loading: boolean;
  onSubmit: (data: CreateItemRequest) => void;
  onCancel: () => void;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  open,
  editingItem,
  lockedFields = [],
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<CreateItemRequest>();
  const isEdit = editingItem !== null;

  // Điền dữ liệu khi mở modal chỉnh sửa
  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.setFieldsValue({
          code: editingItem.code,
          name: editingItem.name,
          itemType: editingItem.itemType,
          dosageForm: editingItem.dosageForm,
          strength: editingItem.strength,
          baseUnit: editingItem.baseUnit,
          salePrice: editingItem.salePrice,
          minimumStock: editingItem.minimumStock,
          canPrescribe: editingItem.canPrescribe,
          conversions: editingItem.conversions ?? [],
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ itemType: 'THUOC', canPrescribe: false, conversions: [] });
      }
    }
  }, [open, editingItem, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      ...values,
      conversions: values.conversions ?? [],
    });
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Chỉnh sửa mặt hàng' : 'Thêm mặt hàng mới'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={680}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" size="middle">
        {/* Hàng 1: Mã + Loại */}
        <Space.Compact style={{ width: '100%', gap: 12, display: 'flex' }}>
          <Form.Item
            label="Mã hàng"
            name="code"
            style={{ flex: 1 }}
            tooltip={lockedFields.includes('code') ? 'Không thể thay đổi mã khi đã có giao dịch' : undefined}
          >
            <Input
              placeholder="Tự động tạo nếu để trống"
              disabled={lockedFields.includes('code')}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Loại"
            name="itemType"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select
              disabled={isEdit}
              options={[
                { value: 'THUOC', label: 'Thuốc' },
                { value: 'VA_TU', label: 'Vật tư' },
              ]}
            />
          </Form.Item>
        </Space.Compact>

        {/* Tên */}
        <Form.Item
          label="Tên thuốc / vật tư"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên mặt hàng' },
            { max: 200, message: 'Tên không vượt quá 200 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên thuốc hoặc vật tư" allowClear />
        </Form.Item>

        {/* Hàng 2: Dạng bào chế + Hàm lượng */}
        <Space.Compact style={{ width: '100%', gap: 12, display: 'flex' }}>
          <Form.Item label="Dạng bào chế" name="dosageForm" style={{ flex: 1 }}>
            <Input placeholder="Viên nén, Ống tiêm, Gói..." allowClear />
          </Form.Item>
          <Form.Item label="Hàm lượng" name="strength" style={{ flex: 1 }}>
            <Input placeholder="500mg, 250ml..." allowClear />
          </Form.Item>
        </Space.Compact>

        {/* Hàng 3: Đơn vị cơ bản + Giá bán lẻ + Tồn tối thiểu */}
        <Space.Compact style={{ width: '100%', gap: 12, display: 'flex' }}>
          <Form.Item
            label="Đơn vị cơ bản"
            name="baseUnit"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập đơn vị cơ bản' }]}
            tooltip={lockedFields.includes('baseUnit') ? 'Không thể thay đổi khi đã có giao dịch' : undefined}
          >
            <Input
              placeholder="Viên, Ống, Gói..."
              disabled={lockedFields.includes('baseUnit')}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Giá bán lẻ (đ)"
            name="salePrice"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập giá bán lẻ' }]}
          >
            <InputNumber
              min={0}
              step={500}
              style={{ width: '100%' }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
              placeholder="0"
            />
          </Form.Item>
          <Form.Item
            label="Tồn tối thiểu"
            name="minimumStock"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập tồn tối thiểu' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
        </Space.Compact>

        {/* Kê đơn được */}
        <Form.Item name="canPrescribe" valuePropName="checked">
          <Checkbox>Cho phép kê đơn</Checkbox>
        </Form.Item>

        <Divider style={{ margin: '8px 0 12px' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Đơn vị chuyển đổi
          </Text>
          {lockedFields.includes('conversions') && (
            <Text type="danger" style={{ fontSize: 11, marginLeft: 8 }}>
              (Khóa – đã có giao dịch)
            </Text>
          )}
        </Divider>

        {/* Form.List: đơn vị chuyển đổi */}
        <Form.List name="conversions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  align="baseline"
                  style={{ display: 'flex', marginBottom: 8, gap: 8 }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'unit']}
                    rules={[{ required: true, message: 'Nhập đơn vị đích' }]}
                    style={{ marginBottom: 0, flex: 1, minWidth: 120 }}
                  >
                    <Input
                      placeholder="Đơn vị đích (Hộp, Vỉ...)"
                      disabled={lockedFields.includes('conversions')}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'factor']}
                    rules={[
                      { required: true, message: 'Nhập hệ số' },
                      { type: 'number', min: 1, message: 'Hệ số ≥ 1' },
                    ]}
                    style={{ marginBottom: 0, width: 120 }}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="Hệ số"
                      disabled={lockedFields.includes('conversions')}
                    />
                  </Form.Item>
                  {!lockedFields.includes('conversions') && (
                    <MinusCircleOutlined
                      style={{ color: '#f5222d', cursor: 'pointer', fontSize: 16 }}
                      onClick={() => remove(name)}
                    />
                  )}
                </Space>
              ))}
              {!lockedFields.includes('conversions') && (
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  Thêm đơn vị chuyển đổi
                </Button>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ItemFormModal;
