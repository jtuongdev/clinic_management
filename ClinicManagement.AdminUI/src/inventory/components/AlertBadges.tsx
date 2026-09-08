import React from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import {
  WarningOutlined,
  ClockCircleOutlined,
  FallOutlined,
  AlertOutlined,
} from '@ant-design/icons';

interface AlertBadgesProps {
  totalItems: number;
  lowStockCount: number;
  expiringCount: number; // hết hạn trong 60 ngày
  expiredCount: number;  // đã hết hạn còn tồn
}

const AlertBadges: React.FC<AlertBadgesProps> = ({
  totalItems,
  lowStockCount,
  expiringCount,
  expiredCount,
}) => {
  const cards = [
    {
      title: 'Tổng mặt hàng',
      value: totalItems,
      prefix: <AlertOutlined style={{ color: '#1677ff' }} />,
      valueStyles: { color: '#1677ff' },
      bgColor: '#e6f4ff',
      borderColor: '#91caff',
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
