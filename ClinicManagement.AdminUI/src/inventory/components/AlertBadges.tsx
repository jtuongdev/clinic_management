import React from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import {
  WarningOutlined,
  ClockCircleOutlined,
  FallOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

interface AlertBadgesProps {
  totalItems: number;
  inStockCount?: number;
  lowStockCount: number;
  expiringCount: number; // hết hạn trong 60 ngày
  expiredCount: number;  // đã hết hạn còn tồn
  onFilterChange?: (status: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK') => void;
}

const AlertBadges: React.FC<AlertBadgesProps> = ({
  totalItems,
  inStockCount,
  lowStockCount,
  expiringCount,
  expiredCount,
  onFilterChange,
}) => {
  const cards = [
    {
      key: 'IN_STOCK',
      title: 'Đang có tồn kho',
      value: inStockCount ?? totalItems,
      prefix: <DatabaseOutlined style={{ color: '#08979c' }} />,
      valueStyles: { color: '#08979c' },
      bgColor: '#e6fffb',
      borderColor: '#87e8de',
      suffix: inStockCount !== undefined ? `/ ${totalItems} danh mục` : undefined,
    },
    {
      title: 'Tồn kho thấp',
      value: lowStockCount,
      prefix: <FallOutlined style={{ color: '#fa8c16' }} />,
      valueStyles: { color: '#fa8c16' },
      bgColor: '#fff7e6',
      borderColor: '#ffd591',
      suffix: 'mặt hàng',
    },
    {
      title: 'Sắp hết hạn (60 ngày)',
      value: expiringCount,
      prefix: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      valueStyles: { color: '#faad14' },
      bgColor: '#fffbe6',
      borderColor: '#ffe58f',
      suffix: 'lô',
    },
    {
      title: 'Đã hết hạn (còn tồn)',
      value: expiredCount,
      prefix: <WarningOutlined style={{ color: '#f5222d' }} />,
      valueStyles: { color: '#f5222d' },
      bgColor: '#fff1f0',
      borderColor: '#ffa39e',
      suffix: 'lô',
    },
  ];

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      {cards.map((card, idx) => (
        <Col key={idx} xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              background: card.bgColor,
              borderColor: card.borderColor,
              borderRadius: 8,
            }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            <Statistic
              title={
                <span style={{ fontSize: 12, color: '#595959' }}>
                  {card.title}
                </span>
              }
              value={card.value}
              prefix={card.prefix}
              suffix={
                card.suffix ? (
                  <span style={{ fontSize: 12, fontWeight: 400 }}>
                    {card.suffix}
                  </span>
                ) : undefined
              }
              styles={{ content: { ...card.valueStyles, fontSize: 24, fontWeight: 700 } }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AlertBadges;
