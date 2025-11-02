import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', ...props }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
        "animate-fade-in"
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={cn(
          'bg-card border border-border rounded-lg shadow-lg w-full',
          sizes[size],
          'max-h-[90vh] overflow-y-auto',
          'slide-in-up'
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 id="modal-title" className="text-xl font-semibold text-text">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-all hover:bg-surface rounded-lg p-2 ripple-container"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

