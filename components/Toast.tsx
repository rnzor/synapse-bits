import React, { useEffect } from 'react';
import { IconCheck, IconX, IconZap } from './Icons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
      case 'error': return 'border-rose-500/50 bg-rose-500/10 text-rose-200';
      default: return 'border-indigo-500/50 bg-indigo-500/10 text-indigo-200';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <IconCheck className="w-5 h-5 text-emerald-400" />;
      case 'error': return <IconX className="w-5 h-5 text-rose-400" />;
      default: return <IconZap className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className={`mb-3 flex items-center space-x-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300 ${getStyles()}`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <p className="text-sm font-medium pr-4">{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <IconX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
