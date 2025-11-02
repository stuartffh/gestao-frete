import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * usePerformanceMetrics - Hook para monitorar Core Web Vitals
 *
 * Monitora e loga as métricas de performance:
 * - CLS (Cumulative Layout Shift): < 0.1 (bom)
 * - FID (First Input Delay): < 100ms (bom)
 * - FCP (First Contentful Paint): < 1.8s (bom)
 * - LCP (Largest Contentful Paint): < 2.5s (bom)
 * - TTFB (Time to First Byte): < 600ms (bom)
 *
 * @param {Boolean} enabled - Se deve monitorar (default: apenas em desenvolvimento)
 * @param {Function} onMetric - Callback para processar métricas (opcional)
 */
export default function usePerformanceMetrics(enabled = import.meta.env.DEV, onMetric) {
  useEffect(() => {
    if (!enabled) return;

    const handleMetric = (metric) => {
      // Log no console (dev mode)
      if (import.meta.env.DEV) {
        const { name, value, rating } = metric;
        const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`${emoji} [Web Vitals] ${name}:`, {
          value: Math.round(value),
          rating,
          metric,
        });
      }

      // Callback customizado (ex: enviar para analytics)
      if (onMetric) {
        onMetric(metric);
      }
    };

    // Registrar listeners para cada métrica
    onCLS(handleMetric);
    onFID(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, [enabled, onMetric]);
}
