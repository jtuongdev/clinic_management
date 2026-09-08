import React, { useState, useEffect, useCallback } from 'react';
import { Space, Input, Switch, Button, Typography, App } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { inventoryApi } from '../api/inventory.api';
import { StockDto, StockAlertDto } from '../types/inventory.types';
import StockTable from '../components/StockTable';
import AlertBadges from '../components/AlertBadges';

const { Text } = Typography;

const StockPage: React.FC = () => {
  const { message } = App.useApp();

  const [items, setItems] = useState<StockDto[]>([]);
  const [alerts, setAlerts] = useState<StockAlertDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getStock({ keyword, lowStockOnly, pageIndex, pageSize });
      if (res.data.success) {
        setItems(res.data.data.items);
        setTotal(res.data.data.total);
      }
    } catch {
      message.error('Không thể tải dữ liệu tồn kho.');
    } finally {
      setLoading(false);
    }
  }, [keyword, lowStockOnly, pageIndex, pageSize]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await inventoryApi.getStockAlerts({ expiringWithinDays: 60 });
      if (res.data.success) setAlerts(res.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const lowStockCount  = items.filter(i => i.isLowStock).length;
  const expiringCount  = alerts.filter(a => {
    if (!a.expiryDate) return false;
    const days = Math.floor((new Date(a.expiryDate).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 60;
  }).length;
  const expiredCount = alerts.filter(a => {
    if (!a.expiryDate) return false;
    return new Date(a.expiryDate) < new Date();
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI */}
      <AlertBadges
        totalItems={total}
        lowStockCount={lowStockCount}
        expiringCount={expiringCount}
        expiredCount={expiredCount}
      />

      {/* Toolbar */}
      <div className="inventory-toolbar">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo mã, tên..."
          style={{ width: 240 }}
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          allowClear
        />
        <Space>
          <Text style={{ fontSize: 13, color: '#6a7f96' }}>Chỉ hiện tồn thấp</Text>
          <Switch
            checked={lowStockOnly}
            onChange={v => { setLowStockOnly(v); setPageIndex(1); }}
            size="small"
          />
        </Space>
        <div className="spacer" />
        {expiredCount > 0 && (
          <Space style={{ color: '#cf1322', fontSize: 12 }}>
            <WarningOutlined /> {expiredCount} lô đã hết hạn còn trong kho
          </Space>
        )}
        <Button icon={<ReloadOutlined />} onClick={() => { fetchStock(); fetchAlerts(); }}>
          Làm mới
        </Button>
      </div>

      {/* Bảng tồn kho */}
      <StockTable
        items={items}
        loading={loading}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={(p, s) => { setPageIndex(p); setPageSize(s); }}
      />
    </div>
  );
};

export default StockPage;
