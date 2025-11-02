import { useState } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const show = (type, message, duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  };

  const hide = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => show('success', message, duration);
  const error = (message, duration = 5000) => show('error', message, duration);
  const warning = (message, duration) => show('warning', message, duration);
  const info = (message, duration) => show('info', message, duration);

  return { toasts, show, hide, success, error, warning, info };
};

