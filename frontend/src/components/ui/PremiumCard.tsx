import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
}

const gradientClasses = {
  cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40',
  blue: 'from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:border-blue-500/40',
  purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40',
  emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40',
  amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40',
  rose: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 hover:border-rose-500/40',
};

export function PremiumCard({
  children,
  className,
  hover = true,
  gradient = 'cyan',
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        'relative group',
        'bg-gradient-to-br',
        gradientClasses[gradient],
        'backdrop-blur-xl border rounded-xl p-6',
        'transition-all duration-300',
        hover && 'hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02]',
        className
      )}
    >
      {/* Glow effect on hover */}
      {hover && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/20 group-hover:via-cyan-500/10 group-hover:to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
      )}
      {children}
    </div>
  );
}
