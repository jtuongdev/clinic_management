import { Card, Statistic, Skeleton } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
  loading?: boolean;
}

export const StatCard = ({ title, value, prefix, suffix, color = '#1890ff', loading = false }: StatCardProps) => {
  return (
    <Card variant="outlined" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 80 }} />
      ) : (
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
      )}
    </Card>
  );
};