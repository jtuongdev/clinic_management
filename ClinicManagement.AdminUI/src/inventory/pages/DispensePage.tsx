import React, { useState } from 'react';
import { Tabs, Button, Card, Form, InputNumber, Input, Space, App } from 'antd';
import { MedicineBoxOutlined, ShopOutlined, ExperimentOutlined, RollbackOutlined, HistoryOutlined } from '@ant-design/icons';
import DispensePanel from '../components/DispensePanel';
import DispensedPanel from '../components/DispensedPanel';
import ExportRetailForm from '../components/ExportRetailForm';
import { inventoryApi } from '../api/inventory.api';
import { ExportRequest, StockMutationRequest } from '../types/inventory.types';

const DispensePage: React.FC = () => {
  const { message } = App.useApp();
  const [exportRetailOpen, setExportRetailOpen] = useState(false);
  const [exportInternalOpen, setExportInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mutationForm] = Form.useForm();

  const handleExportRetail = async (data: ExportRequest) => {
    setLoading(true);
    try {
      const res = await inventoryApi.exportRetail(data);
      if (res.data.success) {
        message.success('Xuất bán lẻ thành công');
        setExportRetailOpen(false);
      }
    } catch {
      message.error('Lỗi khi xuất bán lẻ');
    } finally {
      setLoading(false);
    }
  };

  const handleExportInternal = async (data: ExportRequest) => {
    setLoading(true);
    try {
      const res = await inventoryApi.exportInternalUse(data);
      if (res.data.success) {
        message.success('Xuất thủ thuật thành công');
        setExportInternalOpen(false);
      }
    } catch {
      message.error('Lỗi khi xuất thủ thuật');
    } finally {
      setLoading(false);
    }
  };

  const handleMutation = async (type: 'return' | 'writeoff') => {
    try {
      const values = await mutationForm.validateFields();
      const data: StockMutationRequest = {
        ...values,
        idempotencyKey: `MUT-${Date.now()}`
      };
      setLoading(true);
      if (type === 'return') {
        const res = await inventoryApi.returnToSupplier(data);
        if (res.data.success) message.success('Trả NCC thành công');
      } else {
        const res = await inventoryApi.writeOff(data);
        if (res.data.success) message.success('Xuất hủy thành công');
      }
      mutationForm.resetFields();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        type="card"
        items={[
          {
            key: 'prescription',
            label: <Space><MedicineBoxOutlined />Cấp theo đơn</Space>,
            children: <DispensePanel />
          },
          {
            key: 'dispensed',
            label: <Space><HistoryOutlined />Đã cấp phát</Space>,
            children: <DispensedPanel />
          },
          {
            key: 'retail',
            label: <Space><ShopOutlined />Bán lẻ</Space>,
            children: (
              <Card title="Xuất bán lẻ tại quầy">
                <Button type="primary" onClick={() => setExportRetailOpen(true)}>
                  Tạo đơn bán lẻ mới
                </Button>
              </Card>
            )
          },
          {
            key: 'internal',
            label: <Space><ExperimentOutlined />Xuất thủ thuật</Space>,
            children: (
              <Card title="Xuất dùng phòng thủ thuật">
                <Button type="primary" onClick={() => setExportInternalOpen(true)}>
                  Tạo đơn xuất tiêu hao
                </Button>
              </Card>
            )
          },
          {
            key: 'mutation',
            label: <Space><RollbackOutlined />Trả NCC / Xuất hủy</Space>,
            children: (
              <Card title="Trả NCC hoặc Xuất hủy hàng hỏng/hết hạn" style={{ maxWidth: 600 }}>
                <Form form={mutationForm} layout="vertical">
                  <Form.Item label="Mã lô (Stock ID)" name="stockId" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Lý do" name="reason" rules={[{ required: true }]}>
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Space>
                    <Button type="primary" danger onClick={() => handleMutation('return')} loading={loading}>
                      Trả Nhà Cung Cấp
                    </Button>
                    <Button danger onClick={() => handleMutation('writeoff')} loading={loading}>
                      Xuất Hủy
                    </Button>
                  </Space>
                </Form>
              </Card>
            )
          }
        ]}
      />

      <ExportRetailForm
        open={exportRetailOpen}
        mode="retail"
        loading={loading}
        onSubmit={handleExportRetail}
        onCancel={() => setExportRetailOpen(false)}
      />

      <ExportRetailForm
        open={exportInternalOpen}
        mode="internal"
        loading={loading}
        onSubmit={handleExportInternal}
        onCancel={() => setExportInternalOpen(false)}
      />
    </div>
  );
};

export default DispensePage;
