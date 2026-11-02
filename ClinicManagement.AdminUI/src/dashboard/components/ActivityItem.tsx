import { ReactNode } from 'react';

interface ActivityItemProps {
  dotColor: 'blue' | 'green' | 'orange' | 'red';
  children: ReactNode;
  time: string;
  highlight?: string;
}

const dotColorMap = {
  blue: '#0b4f6c',
  green: '#2e8b57',
  orange: '#d48a2c',
  red: '#c0392b',
};

export const ActivityItem = ({ dotColor, children, time, highlight }: ActivityItemProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid #f5f7fb',
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: dotColorMap[dotColor],
          marginTop: 5,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>
          {children}
          {highlight && <span style={{ color: '#0b4f6c', fontWeight: 600 }}> {highlight}</span>}
        </div>
        <div style={{ fontSize: 11, color: '#8a9fb0', marginTop: 2 }}>🕐 {time}</div>
      </div>
    </div>
  );
};