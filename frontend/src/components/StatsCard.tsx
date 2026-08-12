import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color = 'primary' }) => {
  const colorMap = {
    primary: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8' },
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
    accent: { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8' },
  };

  const theme = colorMap[color];

  return (
    <div className="card stat-card">
      <div>
        <p className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem', fontWeight: 600 }}>
          {title}
        </p>
        <div className="stat-value">{value}</div>
        {trend && <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{trend}</span>}
      </div>
      <div className="stat-icon" style={{ background: theme.bg, color: theme.text }}>
        {icon}
      </div>
    </div>
  );
};
