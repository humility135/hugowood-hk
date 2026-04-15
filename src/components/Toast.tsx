import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 mr-2" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 mr-2" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />,
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-md transition-all transform translate-y-0 opacity-100 ${bgColors[type]} min-w-[300px]`}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
