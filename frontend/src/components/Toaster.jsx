import Toast from './ui/Toast';
import { useToast } from '../hooks/useToast';
import { createContext, useContext } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div 
        className="fixed top-4 right-4 z-toast space-y-2 flex flex-col items-end"
        role="region"
        aria-live="polite"
        aria-atomic="false"
      >
        {toast.toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            {...toastItem}
            onClose={toast.hide}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext deve ser usado dentro de ToastProvider');
  }
  return context;
};

