import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Toast = ({ id, type = 'info', message, duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-success/20 text-success border-success/30',
    error: 'bg-danger/20 text-danger border-danger/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    info: 'bg-info/20 text-info border-info/30',
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[500px]',
        styles[type]
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose?.(id)}
        className="text-current opacity-70 hover:opacity-100"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

