import { Suspense, lazy } from 'react';

/**
 * LazyChart - Componente que carrega gráficos com lazy loading
 *
 * Renderiza um skeleton enquanto o gráfico carrega, melhorando
 * a performance inicial da página.
 *
 * @param {String} type - Tipo do gráfico: 'line', 'bar', 'pie', 'area'
 * @param {Object} ...props - Props passadas para o componente de gráfico
 */

// Lazy load dos componentes de gráfico
const LineChartComponent = lazy(() => import('./charts/LineChartComponent'));
const BarChartComponent = lazy(() => import('./charts/BarChartComponent'));
const PieChartComponent = lazy(() => import('./charts/PieChartComponent'));
const AreaChartComponent = lazy(() => import('./charts/AreaChartComponent'));

// Skeleton loading para gráficos
function ChartSkeleton({ height = 'h-80' }) {
  return (
    <div className={`${height} w-full bg-card rounded-lg border border-border animate-pulse`}>
      <div className="flex items-end justify-around h-full p-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-surface/50 rounded-t"
            style={{ height: `${Math.random() * 60 + 20}%`, width: '100%' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function LazyChart({ type, height, ...props }) {
  let ChartComponent;

  switch (type) {
    case 'line':
      ChartComponent = LineChartComponent;
      break;
    case 'bar':
      ChartComponent = BarChartComponent;
      break;
    case 'pie':
      ChartComponent = PieChartComponent;
      break;
    case 'area':
      ChartComponent = AreaChartComponent;
      break;
    default:
      console.error(`Tipo de gráfico desconhecido: ${type}`);
      return <div className="text-danger">Tipo de gráfico inválido</div>;
  }

  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <ChartComponent {...props} height={height} />
    </Suspense>
  );
}
