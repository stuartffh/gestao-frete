import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * ResponsiveTable - Tabela que se transforma em cards em mobile
 *
 * Em telas >= md: exibe tabela normal
 * Em telas < md: exibe cards empilhados com campos-chave
 *
 * @param {Array} data - Array de dados
 * @param {Array} columns - [{key, label, render, mobileLabel}]
 * @param {Function} onSort - Callback de ordenação
 * @param {Object} sortConfig - {key, direction}
 */
export default function ResponsiveTable({ data = [], columns = [], onSort, sortConfig }) {
  const handleSort = (columnKey) => {
    if (onSort && columnKey) {
      onSort(columnKey);
    }
  };

  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  return (
    <>
      {/* Desktop Table (md+) */}
      <div className="hidden md:block overflow-x-auto bg-card rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-surface border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:text-text' : ''
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
                >
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-surface/50 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-text">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4 space-y-2"
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start">
                <span className="text-xs font-medium text-muted uppercase">
                  {column.mobileLabel || column.label}:
                </span>
                <span className="text-sm text-text text-right ml-2">
                  {column.render ? column.render(row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 text-muted">
          Nenhum registro encontrado
        </div>
      )}
    </>
  );
}
