import React from 'react';
import { Button, Divider, Space } from 'antd';
import {
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  SaveOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ImportReceiptDto } from '../../types/inventory.types';

interface ImportHeaderBarProps {
  initialData?: ImportReceiptDto | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onOpenPO: () => void;
}

export const ImportHeaderBar: React.FC<ImportHeaderBarProps> = ({
  initialData,
  loading,
  onCancel,
  onSubmit,
  onOpenPO,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '14px 20px',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <Space size={14}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onCancel}
          disabled={loading}
          style={{ fontWeight: 600, height: 38 }}
        >
          Quay lại danh sách
        </Button>

        <Divider type="vertical" style={{ height: 28 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MedicineBoxOutlined style={{ color: '#0284c7', fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {initialData
                ? `Chỉnh sửa phiếu nhập kho #${initialData.id}`
                : 'Tạo phiếu nhập kho Dược & Vật tư y tế (Chuẩn GPP)'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Hệ thống quản lý kho Dược lâm sàng, số lô, hạn dùng & quy đổi đơn vị đóng gói
            </div>
          </div>
        </div>
      </Space>

      <Space size={10}>
        {!initialData && (
          <Button
            icon={<FileTextOutlined style={{ color: '#0b4f6c' }} />}
            onClick={onOpenPO}
            style={{
              height: 38,
              padding: '0 16px',
              borderColor: '#0b4f6c',
              color: '#0b4f6c',
              backgroundColor: '#f0fdfa',
              fontWeight: 600,
            }}
          >
            📦 Nhập theo Đơn đặt hàng (PO)
          </Button>
        )}
        <Button onClick={onCancel} disabled={loading} style={{ height: 38, padding: '0 18px' }}>
          Hủy bỏ
        </Button>
        <Button
          type="primary"
          onClick={onSubmit}
          loading={loading}
          icon={<SaveOutlined />}
          style={{
            height: 38,
            padding: '0 22px',
            background: '#0284c7',
            borderColor: '#0284c7',
            fontWeight: 600,
          }}
        >
          {initialData ? 'Cập nhật phiếu nhập' : 'Lưu & Khởi tạo phiếu nhập'}
        </Button>
      </Space>
    </div>
  );
};
