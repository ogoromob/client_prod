// src/components/ui/Select.tsx
import { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Sélectionner...',
      label,
      error,
      disabled = false,
      clearable = false,
      searchable = false,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSearchQuery('');
    };

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}

        {/* Select Button */}
        <button
          ref={ref as any}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between gap-2',
            'px-3 py-2 rounded-md text-sm',
            'bg-dark-800 border text-white',
            'transition-colors',
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-700 hover:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className="truncate">
              {selectedOption?.label || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {clearable && value && !disabled && (
              <button
                onClick={handleClear}
                className="p-0.5 hover:bg-dark-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {/* Error Message */}
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-dropdown w-full mt-2',
                'bg-dark-800 border border-gray-700 rounded-md shadow-xl',
                'max-h-60 overflow-hidden'
              )}
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-gray-700">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md text-sm text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  />
                </div>
              )}

              {/* Options List */}
              <div className="overflow-y-auto max-h-52">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2',
                        'text-sm text-left transition-colors',
                        option.value === value
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-gray-300 hover:bg-dark-700',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {option.value === value && (
                        <Check className="h-4 w-4 flex-shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-gray-500">
                    Aucun résultat trouvé
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = 'Select';
