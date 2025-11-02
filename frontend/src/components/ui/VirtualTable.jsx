import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * VirtualTable - Tabela com virtualização para listas longas (> 100 itens)
 *
 * Renderiza apenas as linhas visíveis na viewport, melhorando drasticamente
 * a performance para grandes conjuntos de dados.
 *
 * @param {Array} data - Array de dados
 * @param {Array} columns - Array de definições de colunas [{key, label, render}]
 * @param {Function} onSort - Callback para ordenação
 * @param {Object} sortConfig - Estado de ordenação {key, direction}
 * @param {Number} rowHeight - Altura de cada linha em pixels (padrão: 60)
 * @param {Number} overscan - Número de itens extras para renderizar fora da viewport (padrão: 5)
 */
export default function VirtualTable({
  data = [],
  columns = [],
  onSort,
  sortConfig,
  rowHeight = 60,
  overscan = 5,
}) {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  // Auto-scroll para o topo quando os dados mudam
  useEffect(() => {
    rowVirtualizer.scrollToIndex(0, { align: 'start' });
  }, [data]);

  const handleSort = (columnKey) => {
    if (onSort && columnKey) {
      onSort(columnKey);
    }
  };

  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={16} className="inline ml-1" aria-hidden="true" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" aria-hidden="true" />
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header (fixo) */}
      <div className="bg-surface border-b border-border">
        <div className="grid" style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}>
          {columns.map((column) => (
            <div
              key={column.key}
              className={`px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider ${
                column.sortable ? 'cursor-pointer hover:text-text transition-colors' : ''
              }`}
              onClick={() => column.sortable && handleSort(column.key)}
              role={column.sortable ? 'button' : undefined}
              aria-sort={
                sortConfig?.key === column.key
                  ? sortConfig.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
              tabIndex={column.sortable ? 0 : undefined}
              onKeyDown={(e) => {
                if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSort(column.key);
                }
              }}
            >
              {column.label}
              {column.sortable && getSortIcon(column.key)}
            </div>
          ))}
        </div>
      </div>

      {/* Body (virtualizado) */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: '600px' }}
        role="rowgroup"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 w-full border-b border-border hover:bg-surface/50 transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                role="row"
              >
                <div
                  className="grid h-full items-center"
                  style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="px-4 py-3 text-sm text-text"
                      role="cell"
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer com contador */}
      <div className="bg-surface border-t border-border px-4 py-2 text-xs text-muted">
        {data.length} {data.length === 1 ? 'item' : 'itens'}
        {' • '}
        Renderizando {rowVirtualizer.getVirtualItems().length} linhas visíveis
      </div>
    </div>
  );
}
