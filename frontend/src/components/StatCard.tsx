import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'accent' | 'danger' | 'neutral';
  children?: ReactNode;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'neutral', children }: StatCardProps) {
  const colorClasses = {
    accent: 'text-brand-accent border-brand-accent/30 shadow-glow',
    danger: 'text-brand-danger border-brand-danger/30 shadow-glow-danger',
    neutral: 'text-brand-text-primary border-brand-border',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '',
  };

  return (
    <div className="glass-card p-6 hover:border-brand-accent/50 transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-sm font-medium text-brand-text-secondary uppercase tracking-wider mb-2">
            {title}
          </div>
          <div className={`text-3xl font-bold ${colorClasses[color]} transition-colors`}>
            {trend && <span className="mr-1">{trendIcons[trend]}</span>}
            {value}
          </div>
          {subtitle && (
            <div className={`text-sm mt-1 ${
              color === 'accent' ? 'text-brand-accent/70' : 
              color === 'danger' ? 'text-brand-danger/70' : 
              'text-brand-text-secondary'
            }`}>
              {subtitle}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${
            color === 'accent' ? 'bg-brand-accent/10 text-brand-accent' :
            color === 'danger' ? 'bg-brand-danger/10 text-brand-danger' :
            'bg-brand-border/30 text-brand-text-secondary'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
