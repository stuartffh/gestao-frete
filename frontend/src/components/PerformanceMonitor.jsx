import { useState } from 'react';
import usePerformanceMetrics from '../hooks/usePerformanceMetrics';
import { Activity, X } from 'lucide-react';

/**
 * PerformanceMonitor - Painel de métricas de performance (Dev Only)
 *
 * Exibe Core Web Vitals em tempo real no canto da tela.
 * Apenas visível em modo desenvolvimento.
 */
export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  usePerformanceMetrics(true, (metric) => {
    setMetrics((prev) => ({
      ...prev,
      [metric.name]: {
        value: Math.round(metric.value),
        rating: metric.rating,
      },
    }));
  });

  // Não renderizar em produção
  if (!import.meta.env.DEV) return null;

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good':
        return 'text-success';
      case 'needs-improvement':
        return 'text-warning';
      default:
        return 'text-danger';
    }
  };

  const getRatingBg = (rating) => {
    switch (rating) {
      case 'good':
        return 'bg-success/10';
      case 'needs-improvement':
        return 'bg-warning/10';
      default:
        return 'bg-danger/10';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-toast">
      {isOpen ? (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h3 className="font-semibold text-text">Performance</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-text transition-colors"
              aria-label="Fechar monitor de performance"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(metrics).map(([name, data]) => (
              <div
                key={name}
                className={`flex items-center justify-between px-3 py-2 rounded ${getRatingBg(data.rating)}`}
              >
                <span className="text-sm font-medium text-text">{name}</span>
                <span className={`text-sm font-bold ${getRatingColor(data.rating)}`}>
                  {name === 'CLS' ? data.value / 1000 : data.value}
                  {name !== 'CLS' && 'ms'}
                </span>
              </div>
            ))}

            {Object.keys(metrics).length === 0 && (
              <p className="text-xs text-muted text-center py-4">
                Interaja com a página para ver métricas
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted">
              <strong>Bom:</strong> CLS &lt; 0.1, FID &lt; 100ms, LCP &lt; 2.5s
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-card border border-border rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
          aria-label="Abrir monitor de performance"
          title="Monitor de Performance (Dev Only)"
        >
          <Activity size={20} className="text-primary" />
        </button>
      )}
    </div>
  );
}
