// src/components/ui/Tooltip.tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delay = 200,
  disabled = false,
  className,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const offset = 8; // Distance from trigger

    let top = 0;
    let left = 0;

    // Calculate position based on side
    switch (side) {
      case 'top':
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        if (align === 'start') left = rect.left;
        if (align === 'end') left = rect.right;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        if (align === 'start') left = rect.left;
        if (align === 'end') left = rect.right;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        if (align === 'start') top = rect.top;
        if (align === 'end') top = rect.bottom;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        if (align === 'start') top = rect.top;
        if (align === 'end') top = rect.bottom;
        break;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    updatePosition();
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransformOrigin = () => {
    const origins = {
      top: 'bottom center',
      bottom: 'top center',
      left: 'right center',
      right: 'left center',
    };
    return origins[side];
  };

  const getTransform = () => {
    const transforms: Record<string, string> = {
      top: 'translate(-50%, -100%)',
      bottom: 'translate(-50%, 0)',
      left: 'translate(-100%, -50%)',
      right: 'translate(0, -50%)',
    };

    if (align === 'start') {
      if (side === 'top' || side === 'bottom') {
        return transforms[side].replace('-50%', '0');
      }
    } else if (align === 'end') {
      if (side === 'top' || side === 'bottom') {
        return transforms[side].replace('-50%', '-100%');
      }
    }

    return transforms[side];
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                transform: getTransform(),
                transformOrigin: getTransformOrigin(),
                zIndex: 1060,
              }}
              className={cn(
                'px-3 py-1.5 text-sm text-white bg-dark-950 rounded-lg shadow-xl border border-gray-700',
                'max-w-xs break-words',
                className
              )}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={handleMouseLeave}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// Simple tooltip without positioning logic (uses CSS)
export function SimpleTooltip({
  children,
  content,
  className,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="group relative inline-block">
      {children}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'px-3 py-1.5 text-sm text-white bg-dark-950 rounded-lg shadow-xl border border-gray-700',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-200',
          'pointer-events-none whitespace-nowrap',
          className
        )}
      >
        {content}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="w-2 h-2 rotate-45 bg-dark-950 border-r border-b border-gray-700" />
        </div>
      </div>
    </div>
  );
}
