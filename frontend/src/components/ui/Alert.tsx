// src/components/ui/Alert.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 transition-all',
  {
    variants: {
      variant: {
        default: 'bg-dark-800/50 border-gray-700 text-gray-300',
        success: 'bg-green-500/10 border-green-500/30 text-green-400',
        warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

const icons = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      icon: customIcon,
      showIcon = true,
      closable = false,
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = customIcon || (variant && showIcon ? icons[variant] : null);

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant }), className)}
        role="alert"
        {...props}
      >
        <div className="flex gap-3">
          {Icon && (
            <div className="flex-shrink-0">
              <Icon className="h-5 w-5" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {title && (
              <h5 className="mb-1 font-semibold leading-none tracking-tight">
                {title}
              </h5>
            )}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
            {children && <div className="mt-2 text-sm">{children}</div>}
          </div>

          {closable && onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-auto -mr-1 -mt-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert, alertVariants };
