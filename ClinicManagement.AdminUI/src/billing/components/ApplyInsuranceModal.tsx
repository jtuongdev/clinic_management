import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Typography, Alert, App } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { HoaDonListItemDto, HoaDonDetailDto } from '../types/billing.types';
import { billingApi } from '../api/billing.api';

const { Text } = Typography;

interface ApplyInsuranceModalProps {
  open: boolean;
  invoice: HoaDonListItemDto | HoaDonDetailDto | null;
  onClose: () => void;
  onSuccess: (updated: HoaDonDetailDto) => void;
}

export const ApplyInsuranceModal: React.FC<ApplyInsuranceModalProps> = ({
  open,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && invoice) {
      form.setFieldsValue({
        soTienBaoHiem: invoice.soTienBaoHiemChiTra || 0,
      });
    }
  }, [open, invoice, form]);

  const handleSubmit = async () => {
    if (!invoice) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await billingApi.applyInsurance(invoice.id, {
        soTienBaoHiem: values.soTienBaoHiem,
      });

      if (res.data.success && res.data.data) {
        message.success('Áp dụng bảo hiểm thành công');
        onSuccess(res.data.data);
        onClose();
      } else {
        message.error(res.data.message || 'Lỗi khi áp dụng bảo hiểm');
      }
    } catch {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  const tongTien = invoice?.tongTien ?? 0;

  return (
    <Modal
      open={open}
      title={
        <span>
          <SafetyCertificateOutlined style={{ color: '#0284c7', marginRight: 8 }} />
          Áp dụng BHYT / Bảo lãnh viện phí ({invoice?.soHoaDon})
        </span>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Lưu bảo hiểm"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
      width={480}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          type="info"
          showIcon
          message={
            <div>
              Tổng chi phí hóa đơn: <Text strong>{tongTien.toLocaleString('vi-VN')} ₫</Text>
            </div>
          }
          description="Số tiền BHYT/Bảo lãnh chi trả sẽ được trừ trực tiếp vào phần bệnh nhân phải thanh toán."
        />
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Số tiền BHYT / Bảo hiểm chi trả"
          name="soTienBaoHiem"
          rules={[
            { required: true, message: 'Vui lòng nhập số tiền bảo hiểm' },
            {
              type: 'number',
              min: 0,
              max: tongTien,
              message: `Số tiền bảo hiểm không được vượt quá tổng hóa đơn (${tongTien.toLocaleString('vi-VN')} ₫)`,
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
      </Form>
    </Modal>
  );
};

export default ApplyInsuranceModal;
