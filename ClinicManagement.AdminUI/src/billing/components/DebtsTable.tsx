import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  InputNumber,
  Radio,
  App,
} from 'antd';
import {
  ReloadOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { CongNoDto } from '../types/billing.types';
import { billingApi } from '../api/billing.api';

const { Text } = Typography;

type DebtRow = CongNoDto & { rowKey: string };

const toDebtRows = (items: CongNoDto[]): DebtRow[] =>
  items.map((debt, index) => ({
    ...debt,
    rowKey: [
      debt.id,
      debt.maHoaDon,
      debt.maBenhNhan,
      debt.hanThanhToan,
      index,
    ]
      .map((part) => String(part ?? ''))
      .join('-'),
  }));

export const DebtsTable: React.FC = () => {
  const { message } = App.useApp();

  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'overdue' | 'patient'>('overdue');
  const [patientIdInput, setPatientIdInput] = useState<number | null>(null);
  const [searchedPatientId, setSearchedPatientId] = useState<number | null>(null);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'overdue') {
        const res = await billingApi.getOverdueDebts(0);
        if (res.data.success && res.data.data) {
          setDebts(toDebtRows(res.data.data));
        } else {
          setDebts([]);
        }
      } else if (searchedPatientId) {
        const res = await billingApi.getPatientDebts(searchedPatientId);
        if (res.data.success && res.data.data) {
          setDebts(toDebtRows(res.data.data));
        } else {
          setDebts([]);
        }
      } else {
        setDebts([]);
      }
    } catch {
      message.error('Không thể tải danh sách công nợ');
    } finally {
      setLoading(false);
    }
  }, [viewMode, searchedPatientId, message]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const isOverdue = (dateStr?: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const columns: ColumnsType<CongNoDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Số tiền nợ ban đầu',
      dataIndex: 'soTienNo',
      key: 'soTienNo',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'soTienDaTra',
      key: 'soTienDaTra',
      align: 'right',
      render: (val) => (
        <Text style={{ color: '#16a34a' }}>{formatCurrency(val)}</Text>
      ),
    },
    {
      title: 'Số tiền còn lại',
      dataIndex: 'soTienConLai',
      key: 'soTienConLai',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#cf1322', fontSize: 14 }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'hanThanhToan',
      key: 'hanThanhToan',
      render: (d) => {
        const overdue = isOverdue(d);
        return (
          <Space>
            <Text style={{ color: overdue ? '#cf1322' : undefined }}>
              {formatDate(d)}
            </Text>
            {overdue && <Tag color="error">Quá hạn</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      align: 'center',
      render: (st) => {
        switch (st) {
          case 'DANG_NO':
            return <Tag color="warning">Đang nợ</Tag>;
          case 'DA_TAT_TOAN':
            return <Tag color="success">Đã tất toán</Tag>;
          case 'QUA_HAN':
            return <Tag color="error">Quá hạn</Tag>;
          default:
            return <Tag>{st}</Tag>;
        }
      },
    },
  ];

  const totalDebtAmount = debts.reduce((sum, d) => sum + (d.soTienConLai || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Control & Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <Space wrap size="middle">
          <Radio.Group
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value);
              if (e.target.value === 'patient') {
                setSearchedPatientId(null);
                setDebts([]);
              }
            }}
            buttonStyle="solid"
          >
            <Radio.Button value="overdue">
              <ExclamationCircleOutlined style={{ marginRight: 6 }} />
              Công nợ quá hạn
            </Radio.Button>
            <Radio.Button value="patient">
              <DollarOutlined style={{ marginRight: 6 }} />
              Theo bệnh nhân
            </Radio.Button>
          </Radio.Group>

          {viewMode === 'patient' && (
            <Space>
              <InputNumber
                placeholder="Nhập MaBenhNhan..."
                value={patientIdInput}
                onChange={(val) => setPatientIdInput(val)}
                onPressEnter={() => setSearchedPatientId(patientIdInput)}
                style={{ width: 180 }}
                min={1}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                disabled={!patientIdInput}
                onClick={() => setSearchedPatientId(patientIdInput)}
              >
                Tra cứu
              </Button>
            </Space>
          )}
        </Space>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDebts} loading={loading}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Summary Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Text strong>
            {viewMode === 'overdue'
              ? 'Danh sách các khoản nợ viện phí đã quá hạn thanh toán'
              : `Công nợ của bệnh nhân #${searchedPatientId || '--'}`}
          </Text>
          <Tag color={viewMode === 'overdue' ? 'error' : 'orange'}>
            {debts.length} khoản nợ
          </Tag>
        </Space>

        <div>
          <Text type="secondary">Tổng nợ tồn đọng: </Text>
          <Text strong style={{ color: '#cf1322', fontSize: 16 }}>
            {formatCurrency(totalDebtAmount)}
          </Text>
        </div>
      </div>

      {/* Table */}
      <Table<DebtRow>
        rowKey="rowKey"
        columns={columns}
        dataSource={debts}
        loading={loading}
        size="middle"
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              {viewMode === 'patient' && !searchedPatientId
                ? 'Nhập MaBenhNhan (ID nội bộ, ví dụ 6007) rồi bấm Tra cứu'
                : 'Không có khoản nợ nào'}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default DebtsTable;
