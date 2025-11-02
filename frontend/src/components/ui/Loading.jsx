import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 20, className }) => {
  return <Loader2 className={`animate-spin ${className || ''}`} size={size} />;
};

export const LoadingSkeleton = ({ lines = 3, className }) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface rounded skeleton-shimmer mb-2"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
};

export const LoadingPage = ({ message = 'Carregando...' }) => {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
        <p className="text-muted">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

