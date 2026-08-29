import { Card, Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
}

export const StatCard = ({ title, value, prefix, suffix, color = '#1890ff' }: StatCardProps) => {
  return (
    <Card variant="outlined" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        styles={{
          content: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: color,
          },
        }}
      />
    </Card>
  );
};