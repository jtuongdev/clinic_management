import { ReactNode } from 'react';

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export const QuickAction = ({ icon, label, onClick }: QuickActionProps) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #e9edf4',
        borderRadius: 8,
        padding: '12px 10px',
        textAlign: 'center',
        cursor: 'pointer',
        background: '#fafcfe',
        transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f0f4fa';
        e.currentTarget.style.borderColor = '#b8c8d8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#fafcfe';
        e.currentTarget.style.borderColor = '#e9edf4';
      }}
    >
      <div style={{ fontSize: 18, color: '#0b4f6c', display: 'block', marginBottom: 4 }}>{icon}</div>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#1e293b' }}>{label}</span>
    </div>
  );
};