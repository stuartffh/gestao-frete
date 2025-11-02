import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Combobox = ({
  options = [],
  value,
  onChange,
  placeholder = 'Selecione ou digite para buscar...',
  label,
  className,
  error,
  helperText,
  onSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

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

  // Atualizar opções filtradas quando searchTerm mudar
  useEffect(() => {
    if (onSearch) {
      // Se há callback de busca, usar ele (para busca no servidor)
      onSearch(searchTerm).then(setFilteredOptions);
    } else {
      // Busca local
      const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, onSearch]);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-muted mb-2">
          {label}
        </label>
      )}

      {/* Campo de busca/seleção */}
      <div
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex items-center gap-2 min-h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text cursor-text focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
          error && 'border-danger focus-within:ring-danger',
          isOpen && 'ring-2 ring-primary'
        )}
      >
        <Search size={18} className="text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (selectedOption?.label || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 outline-none text-text placeholder:text-muted"
          onFocus={() => setIsOpen(true)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button
              onClick={handleClear}
              className="text-muted hover:text-danger transition-colors"
              aria-label="Limpar"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={cn(
              'text-muted transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-dropdown w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted text-center">
                {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma opção disponível'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded hover:bg-surface transition-colors',
                      isSelected && 'bg-primary/10'
                    )}
                  >
                    {isSelected && <Check size={16} className="text-primary" />}
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

export default Combobox;

