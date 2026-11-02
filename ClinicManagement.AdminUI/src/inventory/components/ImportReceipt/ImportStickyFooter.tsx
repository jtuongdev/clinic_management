import React from 'react';
import { Space, Typography, Divider, Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { formatCurrency } from './helpers';

const { Text } = Typography;

interface ImportStickyFooterProps {
  validItemCount: number;
  totalAmount: number;
  loading: boolean;
  isEditMode: boolean;
  onCancel: () => void;
}

export const ImportStickyFooter: React.FC<ImportStickyFooterProps> = ({
  validItemCount,
  totalAmount,
  loading,
  isEditMode,
  onCancel,
}) => {
  return (
    <div
      style={{
        marginTop: 24,
        padding: '14px 24px',
        background: '#ffffff',
        borderRadius: 8,
        border: '1px solid #cbd5e1',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
      }}
    >
      <Space size={24}>
        <Text style={{ color: '#475569', fontSize: 13.5 }}>
          Số mặt hàng hợp lệ:{' '}
          <strong style={{ color: '#0f172a', fontSize: 15 }}>
            {validItemCount}
          </strong>{' '}
          mặt hàng
        </Text>

        <Divider type="vertical" style={{ height: 24 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: '#475569', fontSize: 14, fontWeight: 600 }}>
            TỔNG CỘNG THANH TOÁN:
          </Text>
          <Text
            strong
            style={{
              fontSize: 22,
              color: '#0284c7',
              fontFamily: 'monospace',
            }}
          >
            {formatCurrency(totalAmount)}
          </Text>
        </div>
      </Space>

      <Space size={10}>
        <Button
          onClick={onCancel}
          disabled={loading}
          style={{ height: 38, padding: '0 20px' }}
        >
          Hủy bỏ
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          style={{
            height: 38,
            padding: '0 26px',
            background: '#0284c7',
            borderColor: '#0284c7',
            fontWeight: 600,
          }}
        >
          {isEditMode ? 'Cập nhật phiếu nhập' : 'Lưu & Khởi tạo phiếu nhập'}
        </Button>
      </Space>
    </div>
  );
};
