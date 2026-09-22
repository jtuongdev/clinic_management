import React, { useState, useEffect, useCallback } from 'react';
import { Space, Input, Button, Typography, App, Segmented } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { inventoryApi } from '../api/inventory.api';
import { StockDto, StockAlertDto } from '../types/inventory.types';
import StockTable from '../components/StockTable';
import AlertBadges from '../components/AlertBadges';

const { Text } = Typography;

type StockFilterType = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

const StockPage: React.FC = () => {
  const { message } = App.useApp();

  const [items, setItems] = useState<StockDto[]>([]);
  const [alerts, setAlerts] = useState<StockAlertDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [summary, setSummary] = useState({
    totalCatalog: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getStock({
        keyword,
        stockStatus: stockFilter,
        pageIndex,
        pageSize,
      });
      if (res.data.success) {
        setItems(res.data.data.items);
        setTotal(res.data.data.total);
        if (res.data.data.totalCatalog !== undefined) {
          setSummary({
            totalCatalog: res.data.data.totalCatalog,
            inStockCount: res.data.data.inStockCount ?? 0,
            lowStockCount: res.data.data.lowStockCount ?? 0,
            outOfStockCount: res.data.data.outOfStockCount ?? 0,
          });
        }
      }
    } catch {
      message.error('Không thể tải dữ liệu tồn kho.');
    } finally {
      setLoading(false);
    }
  }, [keyword, stockFilter, pageIndex, pageSize]);

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

  const expiringCount = alerts.filter(a => {
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
      {/* KPI Banners */}
      <AlertBadges
        totalItems={summary.totalCatalog || total}
        inStockCount={summary.inStockCount}
        lowStockCount={summary.lowStockCount}
        expiringCount={expiringCount}
        expiredCount={expiredCount}
        onFilterChange={(status) => {
          setStockFilter(status);
          setPageIndex(1);
        }}
      />

      {/* Toolbar */}
      <div className="inventory-toolbar" style={{ flexWrap: 'wrap', gap: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo mã, tên..."
          style={{ width: 260 }}
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPageIndex(1); }}
          allowClear
        />

        {/* Bộ lọc trạng thái tồn kho */}
        <Segmented<StockFilterType>
          value={stockFilter}
          onChange={(val) => {
            setStockFilter(val);
            setPageIndex(1);
          }}
          options={[
            { label: `Tất cả (${summary.totalCatalog || total})`, value: 'ALL' },
            { label: `📦 Có tồn kho (${summary.inStockCount})`, value: 'IN_STOCK' },
            { label: `⚠️ Tồn thấp (${summary.lowStockCount})`, value: 'LOW_STOCK' },
            { label: `🚫 Hết hàng (${summary.outOfStockCount})`, value: 'OUT_OF_STOCK' },
          ]}
        />

        <div className="spacer" />

        {expiredCount > 0 && (
          <Space style={{ color: '#cf1322', fontSize: 13, fontWeight: 500 }}>
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
