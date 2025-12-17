// src/components/ui/Progress.tsx
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      label,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Label */}
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-2">
            {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
            {showLabel && (
              <span className="text-sm font-medium text-gray-400">
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div
          className={cn(
            'w-full bg-dark-800 rounded-full overflow-hidden',
            sizeClasses[size]
          )}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={
              animated
                ? {
                    duration: 0.5,
                    ease: 'easeOut',
                  }
                : { duration: 0 }
            }
            className={cn(
              'h-full rounded-full transition-all',
              variantClasses[variant]
            )}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress variant
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    default: '#0ea5e9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-dark-800"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>

      {/* Label */}
      {(showLabel || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showLabel && (
            <span className="text-2xl font-bold text-white">
              {percentage.toFixed(0)}%
            </span>
          )}
          {label && <span className="text-sm text-gray-400 mt-1">{label}</span>}
        </div>
      )}
    </div>
  );
}
