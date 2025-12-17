// src/components/ui/Badge.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
        success: 'bg-success text-white',
        error: 'bg-error text-white',
        warning: 'bg-warning text-white',
        info: 'bg-info text-white',
        outline: 'border-2 border-current bg-transparent',
        ghost: 'bg-transparent hover:bg-dark-800',
        
        // Trading specific
        profit: 'bg-green-500/20 text-green-400 border border-green-500/30',
        loss: 'bg-red-500/20 text-red-400 border border-red-500/30',
        
        // Status specific
        active: 'bg-green-500/20 text-green-400 border border-green-500/30',
        inactive: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
        pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        closed: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && <span className="inline-flex">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
