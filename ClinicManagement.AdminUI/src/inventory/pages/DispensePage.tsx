import React, { useState } from 'react';
import { Tabs, Button, Card, Form, InputNumber, Input, Space, App } from 'antd';
import {
  MedicineBoxOutlined,
  ExperimentOutlined,
  RollbackOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import DispensePanel from '../components/DispensePanel';
import DispensedPanel from '../components/DispensedPanel';
import ProcedureSupplyExportPanel from '../components/ProcedureSupplyExportPanel';
import ExportRetailForm from '../components/ExportRetailForm';
import { inventoryApi } from '../api/inventory.api';
import { ExportRequest, StockMutationRequest } from '../types/inventory.types';
import '../../styles/excel-grid.css';

const DispensePage: React.FC = () => {
  const { message } = App.useApp();
  const [exportInternalOpen, setExportInternalOpen] = useState(false);
  const [exportRefreshKey, setExportRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mutationForm] = Form.useForm();

  const handleExportInternal = async (data: ExportRequest) => {
    setLoading(true);
    try {
      const res = await inventoryApi.exportInternalUse(data);
      if (res.data.success) {
        message.success('Xuất thủ thuật thành công');
        setExportInternalOpen(false);
        setExportRefreshKey((prev) => prev + 1);
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
        idempotencyKey: `MUT-${Date.now()}`,
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
    <div style={styles.pageContainer}>
      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div style={styles.headerBar}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIconBox}>
            <MedicineBoxOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          </div>
          <div>
            <div style={styles.pageTitleWrapper}>
              <h1 style={styles.pageTitle}>Cấp phát thuốc &amp; Xuất kho</h1>
              <span style={styles.liveBadge}>QUẦY DƯỢC PHÁT</span>
            </div>
            <p style={styles.pageSubtitle}>
              Xử lý cấp phát thuốc theo đơn bác sĩ, kiểm tra viện phí, xuất kho theo FEFO và quản lý xuất hủy / trả nhà cung cấp
            </p>
          </div>
        </div>
      </div>

      {/* ── TABS NỘI DUNG ────────────────────────────────────────────────────── */}
      <div style={styles.tabsWrapper}>
        <Tabs
          type="card"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          items={[
            {
              key: 'prescription',
              label: (
                <span style={{ fontWeight: 600, fontSize: 12.5 }}>
                  <MedicineBoxOutlined style={{ marginRight: 6, color: '#2563eb' }} />
                  Cấp theo đơn (Chờ phát)
                </span>
              ),
              children: <DispensePanel />,
            },
            {
              key: 'dispensed',
              label: (
                <span style={{ fontWeight: 600, fontSize: 12.5 }}>
                  <HistoryOutlined style={{ marginRight: 6, color: '#059669' }} />
                  Lịch sử đã cấp phát
                </span>
              ),
              children: <DispensedPanel />,
            },
            {
              key: 'internal',
              label: (
                <span style={{ fontWeight: 600, fontSize: 12.5 }}>
                  <ExperimentOutlined style={{ marginRight: 6, color: '#7c3aed' }} />
                  Xuất vật tư kỹ thuật
                </span>
              ),
              children: (
                <ProcedureSupplyExportPanel
                  key={exportRefreshKey}
                  onCreateExportClick={() => setExportInternalOpen(true)}
                />
              ),
            },
            {
              key: 'mutation',
              label: (
                <span style={{ fontWeight: 600, fontSize: 12.5 }}>
                  <RollbackOutlined style={{ marginRight: 6, color: '#dc2626' }} />
                  Trả NCC / Xuất hủy
                </span>
              ),
              children: (
                <div style={{ padding: '16px 8px', overflowY: 'auto', height: '100%' }}>
                  <Card title="Trả NCC hoặc Xuất hủy hàng hỏng/hết hạn" style={{ maxWidth: 620, borderRadius: 8, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
                    <Form form={mutationForm} layout="vertical">
                      <Form.Item label="Mã lô (Stock ID)" name="stockId" rules={[{ required: true, message: 'Vui lòng nhập Stock ID' }]}>
                        <InputNumber style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 105" />
                      </Form.Item>
                      <Form.Item label="Số lượng xuất" name="quantity" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                        <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 10" />
                      </Form.Item>
                      <Form.Item label="Lý do xuất" name="reason" rules={[{ required: true, message: 'Vui lòng nhập lý do xuất trả/hủy' }]}>
                        <Input.TextArea rows={3} style={{ borderRadius: 6 }} placeholder="VD: Thuốc quá hạn sử dụng / bao bì móp méo..." />
                      </Form.Item>
                      <Space>
                        <Button type="primary" danger onClick={() => handleMutation('return')} loading={loading} style={{ borderRadius: 6 }}>
                          Trả Nhà Cung Cấp
                        </Button>
                        <Button danger onClick={() => handleMutation('writeoff')} loading={loading} style={{ borderRadius: 6 }}>
                          Xuất Hủy
                        </Button>
                      </Space>
                    </Form>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </div>

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

// ── STYLES TIÊU CHUẨN ────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    width: '100%',
    minWidth: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 10px',
    backgroundColor: '#f8fafc',
    gap: 8,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    flexShrink: 0,
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pageTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  liveBadge: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '1px 5px',
    borderRadius: 3,
    letterSpacing: '0.04em',
  },
  pageSubtitle: {
    margin: '2px 0 0',
    fontSize: 11.5,
    color: '#64748b',
  },
  tabsWrapper: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
};
