import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import Badge from './Badge';

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = 'Selecione...',
  label,
  className,
  error,
  helperText,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-muted mb-2">
          {label}
        </label>
      )}

      {/* Campo de seleção */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 min-h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          error && 'border-danger focus-visible:ring-danger',
          isOpen && 'ring-2 ring-primary'
        )}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedOptions.length === 0 ? (
            <span className="text-muted">{placeholder}</span>
          ) : (
            selectedOptions.map(opt => (
              <Badge
                key={opt.value}
                variant="secondary"
                size="sm"
                className="flex items-center gap-1"
              >
                {opt.label}
                <button
                  onClick={(e) => removeOption(opt.value, e)}
                  className="ml-1 hover:text-danger"
                  aria-label={`Remover ${opt.label}`}
                >
                  <X size={12} />
                </button>
              </Badge>
            ))
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn(
            'text-muted transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-dropdown w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded hover:bg-surface transition-colors',
                      isSelected && 'bg-primary/10'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border border-border rounded flex items-center justify-center',
                        isSelected && 'bg-primary border-primary'
                      )}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-text flex-1">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {helperText && (
        <p className={cn('mt-1 text-xs', error ? 'text-danger' : 'text-muted')}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;

