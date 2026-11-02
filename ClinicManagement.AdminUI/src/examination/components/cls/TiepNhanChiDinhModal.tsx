import React, { useState } from 'react';
import { Modal, Form, Input, Typography, Descriptions, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { examinationApi } from '../../api/examination.api';
import type { ChiDinhDichVuListDto } from '../../type/examination.types';

const { Text } = Typography;

interface TiepNhanChiDinhModalProps {
  visible: boolean;
  item: ChiDinhDichVuListDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TiepNhanChiDinhModal: React.FC<TiepNhanChiDinhModalProps> = ({
  visible,
  item,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!item) return;
    try {
      setLoading(true);
      const values = await form.validateFields();
      const res = await examinationApi.tiepNhanChiDinh(item.id, {
        ghiChu: values.ghiChu,
      });

      if (res.data?.success) {
        message.success(`Đã tiếp nhận chỉ định "${item.tenDichVu}" thành công!`);
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(res.data?.message || 'Tiếp nhận chỉ định thất bại');
      }
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Có lỗi xảy ra khi tiếp nhận');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircleOutlined style={{ color: '#0284c7', fontSize: 18 }} />
          <span>Tiếp nhận bệnh nhân / Mẫu xét nghiệm</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Xác nhận tiếp nhận"
      cancelText="Đóng"
      destroyOnClose
      width={540}
    >
      <div style={{ marginTop: 16 }}>
        <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Bệnh nhân">
            <Text strong style={{ color: '#0b4f6c' }}>{item.tenBenhNhan}</Text> ({item.maBenhNhanNoiBo || `BN-${item.maBenhNhan}`})
          </Descriptions.Item>
          <Descriptions.Item label="Dịch vụ / Xét nghiệm">
            <Text strong>{item.tenDichVu}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Loại dịch vụ">
            {item.loaiDichVu || 'Cận lâm sàng'}
          </Descriptions.Item>
          <Descriptions.Item label="Bác sĩ chỉ định">
            {item.tenBacSiChiDinh} - Khoa {item.tenKhoa}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian chỉ định">
            {item.ngayChiDinh ? new Date(item.ngayChiDinh).toLocaleString('vi-VN') : '--'}
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical">
          <Form.Item name="ghiChu" label="Ghi chú khi tiếp nhận (mã mẫu, vị trí lấy mẫu, tình trạng...)">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú nếu có (không bắt buộc)..." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
