import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Select, Input, Button, Space, Typography, Alert, App } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { PhuongThucThanhToanType, HoaDonListItemDto, HoaDonDetailDto } from '../types/billing.types';
import { billingApi } from '../api/billing.api';

const { Text } = Typography;

interface RecordPaymentModalProps {
  open: boolean;
  invoice: HoaDonListItemDto | HoaDonDetailDto | null;
  onClose: () => void;
  onSuccess: (updated: HoaDonDetailDto) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  open,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Remaining debt
  const conNo = invoice
    ? 'soTienBenhNhanChiTra' in invoice
      ? invoice.soTienBenhNhanChiTra - invoice.daThanhToan
      : invoice.tongTien - invoice.soTienBaoHiemChiTra - invoice.daThanhToan
    : 0;

  useEffect(() => {
    if (open && invoice) {
      form.setFieldsValue({
        soTien: conNo > 0 ? conNo : 0,
        phuongThuc: 'TIEN_MAT',
        ghiChu: '',
      });
    }
  }, [open, invoice, conNo, form]);

  const handleSubmit = async () => {
    if (!invoice) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await billingApi.recordPayment(invoice.id, {
        soTien: values.soTien,
        phuongThuc: values.phuongThuc as PhuongThucThanhToanType,
        ghiChu: values.ghiChu?.trim() || undefined,
      });

      if (res.data.success && res.data.data) {
        message.success('Ghi nhận thanh toán thành công');
        onSuccess(res.data.data);
        onClose();
      } else {
        message.error(res.data.message || 'Không thể ghi nhận thanh toán');
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else if (err?.message && !err?.errorFields) {
        message.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const setQuickAmount = (ratio: number) => {
    form.setFieldsValue({ soTien: Math.round(conNo * ratio) });
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <DollarOutlined style={{ color: '#16a34a' }} />
          <span>Thu tiền hóa đơn {invoice?.soHoaDon}</span>
        </Space>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Xác nhận thu tiền"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
      width={500}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          type="info"
          showIcon
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Số tiền bệnh nhân còn nợ:</span>
              <Text strong style={{ fontSize: 16, color: conNo > 0 ? '#cf1322' : '#16a34a' }}>
                {conNo.toLocaleString('vi-VN')} ₫
              </Text>
            </div>
          }
        />
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Số tiền thu"
          name="soTien"
          rules={[
            { required: true, message: 'Vui lòng nhập số tiền thu' },
            {
              type: 'number',
              min: 1000,
              max: conNo > 0 ? conNo : undefined,
              message: conNo > 0
                ? `Số tiền thu tối đa ${conNo.toLocaleString('vi-VN')} ₫`
                : 'Số tiền tối thiểu 1.000 ₫',
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value?.replace(/,/g, '') || 0)}
            addonAfter="₫"
          />
        </Form.Item>

        {conNo > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>Chọn nhanh:</Text>
              <Button size="small" onClick={() => setQuickAmount(1)}>
                Trả đủ (100%)
              </Button>
              <Button size="small" onClick={() => setQuickAmount(0.5)}>
                Trả 50%
              </Button>
            </Space>
          </div>
        )}

        <Form.Item
          label="Phương thức thanh toán"
          name="phuongThuc"
          rules={[{ required: true, message: 'Chọn phương thức' }]}
        >
          <Select
            options={[
              { label: '💵 Tiền mặt (TIEN_MAT)', value: 'TIEN_MAT' },
              { label: '💳 Chuyển khoản ngân hàng (CHUYEN_KHOAN)', value: 'CHUYEN_KHOAN' },
              { label: '🏧 Quẹt thẻ POS (THE)', value: 'THE' },
              { label: '🛡️ Bảo hiểm bảo lãnh (BAO_HIEM)', value: 'BAO_HIEM' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="ghiChu">
          <Input.TextArea rows={2} placeholder="Nội dung phiếu thu hoặc mã tham chiếu GD..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RecordPaymentModal;
