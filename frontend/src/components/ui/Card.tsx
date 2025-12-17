// src/components/ui/Card.tsx
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  glass?: boolean
}

export function Card({ 
  className, 
  hoverEffect = false,
  glass = false,
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-800 bg-dark-700/50 backdrop-blur-sm overflow-hidden',
        hoverEffect && 'transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10',
        glass && 'bg-gradient-to-br from-dark-700/50 to-dark-800/30 backdrop-blur-lg',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-800', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold text-white', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-800', className)}
      {...props}
    />
  )
}
