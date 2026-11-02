import React, { useState, useEffect, useCallback } from 'react';
import { Alert, App } from 'antd';
import { inventoryApi } from '../api/inventory.api';
import { StockDto } from '../types/inventory.types';
import StocktakePanel from '../components/StocktakePanel';

const StocktakePage: React.FC = () => {
  const { message } = App.useApp();
  const [stocks, setStocks] = useState<StockDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getStock({ pageSize: 1000 }); // fetch danh sách tồn
      if (res.data.success) {
        setStocks(res.data.data.items);
      }
    } catch {
      message.error('Không thể tải dữ liệu tồn kho.');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        title="Hướng dẫn kiểm kê"
        description="Lập đợt kiểm kê mới, nhập số lượng thực tế tại kho cho từng mặt hàng/lô, sau đó nộp và duyệt để hệ thống tự động sinh phiếu điều chỉnh."
        type="info"
        showIcon
      />
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #e9edf4' }}>
        <StocktakePanel stocks={stocks} />
      </div>
    </div>
  );
};

export default StocktakePage;
