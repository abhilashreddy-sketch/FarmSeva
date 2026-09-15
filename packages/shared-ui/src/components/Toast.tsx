import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', title, message, onClose }) => {
  const styles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-emerald-50 text-emerald-900',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 text-red-900',
      border: 'border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 text-amber-900',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50 text-sky-900',
      border: 'border-sky-200',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-2xl border shadow-lg max-w-sm flex items-start gap-3 ${current.bg} ${current.border} animate-in slide-in-from-bottom duration-200`}
    >
      {current.icon}
      <div className="flex-1 space-y-0.5">
        <h4 className="font-bold text-xs">{title}</h4>
        {message && <p className="text-[11px] opacity-80 leading-snug">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition" aria-label="Close notification">
          <X className="w-4 h-4 opacity-60" />
        </button>
      )}
    </div>
  );
};
