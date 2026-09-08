import React, { useMemo } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Input,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { ImportReceiptRequest, ImportLineRequest } from '../types/inventory.types';

const { TextArea } = Input;
const { Text } = Typography;

interface ImportFormProps {
  open: boolean;
  loading: boolean;
  onSubmit: (data: ImportReceiptRequest) => void;
  onCancel: () => void;
}

interface ImportFormValues {
  supplierId: number;
  importDate: Dayjs;
  note?: string;
  saveDraft: boolean;
  lines: {
    itemId: number;
    lotNumber: string;
    expiryDate: Dayjs;
    quantity: number;
    purchasePrice: number;
  }[];
}

const ImportForm: React.FC<ImportFormProps> = ({ open, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm<ImportFormValues>();
  const lines = Form.useWatch('lines', form) ?? [];

  const totalAmount = useMemo(() => {
    if (!Array.isArray(lines)) return 0;
    return lines.reduce((sum, line) => {
      if (!line) return sum;
      return sum + (line.quantity ?? 0) * (line.purchasePrice ?? 0);
    }, 0);
  }, [lines]);

  const handleFinish = (values: ImportFormValues) => {
    const payload: ImportReceiptRequest = {
      supplierId: values.supplierId,
      receivedAt: values.importDate.toISOString(),
      note: values.note,
      saveDraft: values.saveDraft ?? true,
      idempotencyKey: `IMP-${Date.now()}`,
      items: values.lines.map(
        (l): ImportLineRequest => ({
          itemId: l.itemId,
          batchNumber: l.lotNumber,
          expiryDate: l.expiryDate.toISOString(),
          quantity: l.quantity,
          purchasePrice: l.purchasePrice,
        }),
      ),
    };
    onSubmit(payload);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('vi-VN') + ' ₫';

  return (
    <Modal
      title="Tạo phiếu nhập kho"
      open={open}
      onCancel={handleCancel}
      width={900}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          importDate: dayjs(),
          saveDraft: true,
          lines: [{ itemId: undefined, lotNumber: '', expiryDate: undefined, quantity: 1, purchasePrice: 0 }],
        }}
        onFinish={handleFinish}
      >
        {/* Thông tin chung */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="supplierId"
              label="Mã nhà cung cấp"
              rules={[{ required: true, message: 'Vui lòng nhập mã nhà cung cấp' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 1001" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="importDate" label="Ngày nhập">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="saveDraft" label="Chế độ lưu" valuePropName="checked">
              <Switch
                checkedChildren="Lưu nháp"
                unCheckedChildren="Nhập ngay"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note" label="Ghi chú">
          <TextArea rows={2} placeholder="Ghi chú thêm về phiếu nhập..." />
        </Form.Item>

        <Divider style={{ margin: '8px 0 16px' }}>
          Danh sách mặt hàng nhập
        </Divider>

        {/* Danh sách dòng */}
        <Form.List
          name="lines"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length < 1) {
                  return Promise.reject(new Error('Phiếu nhập phải có ít nhất 1 mặt hàng'));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'itemId']}
                      label={name === 0 ? 'Mã mặt hàng' : ''}
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber style={{ width: '100%' }} min={1} placeholder="Mã MH" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'lotNumber']}
                      label={name === 0 ? 'Số lô' : ''}
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="VD: LOT-001" />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      {...restField}
                      name={[name, 'expiryDate']}
                      label={name === 0 ? 'Hạn sử dụng' : ''}
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label={name === 0 ? 'Số lượng' : ''}
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      {...restField}
                      name={[name, 'purchasePrice']}
                      label={name === 0 ? 'Đơn giá (₫)' : ''}
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber<number>
                        style={{ width: '100%' }}
                        min={0}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(v) => Number(v?.replace(/,/g, '') ?? '0')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ display: 'flex', alignItems: name === 0 ? 'flex-end' : 'center', paddingBottom: name === 0 ? 1 : 0 }}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    />
                  </Col>
                </Row>
              ))}

              <Form.ErrorList errors={errors} />

              <Button
                type="dashed"
                onClick={() =>
                  add({ itemId: undefined, lotNumber: '', expiryDate: undefined, quantity: 1, purchasePrice: 0 })
                }
                icon={<PlusOutlined />}
                block
                style={{ marginTop: 4 }}
              >
                Thêm dòng mặt hàng
              </Button>
            </>
          )}
        </Form.List>

        {/* Tổng tiền */}
        <div
          style={{
            marginTop: 16,
            padding: '10px 16px',
            background: '#f0f9ff',
            borderRadius: 6,
            border: '1px solid #bae0ff',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text style={{ color: '#4a5568' }}>Tổng tiền nhập:</Text>
          <Text strong style={{ fontSize: 16, color: '#0b4f6c' }}>
            {formatCurrency(totalAmount)}
          </Text>
        </div>

        {/* Footer buttons */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleCancel} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu phiếu nhập
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ImportForm;
