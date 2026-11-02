import React from 'react';
import { Card, Row, Col, Typography, Table, Tag, Empty, Space, Alert } from 'antd';
import {
  DatabaseOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SystemReportsInventoryDto } from '../types/systemReports.types';

const { Title, Text } = Typography;

interface InventoryTabProps {
  data: SystemReportsInventoryDto | null;
  loading: boolean;
}

const formatCurrency = (val: number) => {
  return (val || 0).toLocaleString('vi-VN') + ' đ';
};

export const InventoryTab: React.FC<InventoryTabProps> = ({ data, loading }) => {
  if (!data && !loading) {
    return <Empty description="Chưa có dữ liệu báo cáo kho dược" style={{ padding: 40 }} />;
  }

  const kpis = data?.kpis;

  const lowStockColumns: ColumnsType<any> = [
    {
      title: 'Mã thuốc',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 100,
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: 'Tên thuốc / Hàm lượng',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Kho lưu trữ',
      dataIndex: 'warehouse',
      key: 'warehouse',
      render: (wh) => <Tag color="cyan">{wh}</Tag>,
    },
    {
      title: 'Tồn hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'right',
      render: (st, r) => (
        <span style={{ color: '#ef4444', fontWeight: 700 }}>
          {st} {r.unit}
        </span>
      ),
    },
    {
      title: 'Định mức tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
      align: 'right',
      render: (ms, r) => `${ms} ${r.unit}`,
    },
  ];

  const expiringColumns: ColumnsType<any> = [
    {
      title: 'Tên thuốc',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      render: (b) => <Text code>{b}</Text>,
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (d) => {
        const dateStr = d ? new Date(d).toLocaleDateString('vi-VN') : '--';
        return <Tag color="error">{dateStr}</Tag>;
      },
    },
    {
      title: 'Số lượng còn tồn',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right',
      render: (s) => <strong>{s}</strong>,
    },
  ];

  const topDispensedColumns: ColumnsType<any> = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 90,
      render: (u) => <Tag>{u}</Tag>,
    },
    {
      title: 'Số lượng kê',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: (q) => <span style={{ fontWeight: 700, color: '#0284c7' }}>{q}</span>,
    },
    {
      title: 'Doanh số bán',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (rev) => <span style={{ fontWeight: 600, color: '#059669' }}>{formatCurrency(rev)}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 4 Thẻ KPI Kho Dược */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổng danh mục thuốc & vật tư</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0b4f6c', marginTop: 4 }}>
              {(kpis?.totalSkus || 0).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400 }}>mã</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổng giá trị tồn kho</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#059669', marginTop: 4 }}>
              {formatCurrency(kpis?.totalStockValue || 0)}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Dưới định mức an toàn</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
              {kpis?.lowStockCount || 0} thuốc
            </div>
            <Tag color="error">Cần nhập thêm</Tag>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #fed7aa', background: '#fff7ed' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Sắp hết hạn trong 90 ngày</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ea580c', marginTop: 4 }}>
              {kpis?.expiringCount || 0} lô
            </div>
            <Tag color="warning">Ưu tiên xuất FEFO</Tag>
          </Card>
        </Col>
      </Row>

      {/* Bảng cảnh báo dưới định mức & Cảnh báo hạn dùng */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={13}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ef4444' }} />
                <span>Cảnh báo thuốc dưới định mức tối thiểu</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Table
              columns={lowStockColumns}
              dataSource={data?.lowStockList || []}
              rowKey={(r) => r.itemId + r.warehouse}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={11}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#f59e0b' }} />
                <span>Lô thuốc sắp hết hạn sử dụng (&lt; 90 ngày)</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Table
              columns={expiringColumns}
              dataSource={data?.expiringList || []}
              rowKey={(r) => r.itemId + r.batchNumber}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Top 10 thuốc tiêu thụ nhiều nhất */}
      <Card
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0284c7' }} />
            <span>Top 10 Dược phẩm kê đơn & Doanh thu cao nhất</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={topDispensedColumns}
          dataSource={data?.topDispensed || []}
          rowKey={(r) => r.id}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};
