// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text';
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 bg-[length:200%_100%]',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-dark-800',
        variantClasses[variant],
        animation !== 'shimmer' && animationClasses[animation],
        animation === 'shimmer' && 'overflow-hidden relative',
        className
      )}
      {...props}
    >
      {animation === 'shimmer' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dark-700/50 to-transparent animate-shimmer" />
      )}
    </div>
  );
}

// Skeleton components for common patterns
export function SkeletonCard() {
  return (
    <div className="p-6 space-y-4 bg-dark-800/50 rounded-xl border border-gray-700">
      <Skeleton className="h-12 w-12" variant="circle" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return <Skeleton className={sizeClasses[size]} variant="circle" />;
}
