// src/components/ui/Tabs.tsx
import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

// Main Tabs component
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = 'horizontal',
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const setActiveTab = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab: value, setActiveTab, orientation }}>
      <div
        className={cn(
          orientation === 'horizontal' ? 'space-y-4' : 'flex gap-4',
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabsList component
export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  const { orientation } = useTabsContext();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-dark-800/50 p-1 rounded-lg border border-gray-700',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {children}
    </div>
  );
}

// TabsTrigger component
export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TabsTrigger({
  value,
  children,
  disabled = false,
  className,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'relative px-4 py-2 text-sm font-medium rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900',
        isActive
          ? 'text-white'
          : 'text-gray-400 hover:text-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-primary-500 rounded-md"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// TabsContent component
export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export function TabsContent({
  value,
  children,
  className,
  forceMount = false,
}: TabsContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        !isActive && forceMount && 'hidden',
        className
      )}
      role="tabpanel"
    >
      {children}
    </motion.div>
  );
}

// Export all as named exports
export { useTabsContext };
